import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

import { db } from "@/db";
import { videosTable, videoUpdateSchema } from "@/db/schema";
import { authedProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import { parseVideoEventToStatus, subscribeToEventChannel } from "@lib/server/event-channel";
import { mux } from "@lib/server/mux";
import { redis } from "@lib/server/redis";
import { buildWorkflowURL, workflowClient } from "@lib/server/workflow";
import { getDefaultMuxThumbnailUrl } from "@lib/utils";
import { TRPCError } from "@trpc/server";

import { MuxStatus } from "../constants";

export const videosRouter = createTRPCRouter({
    requestUpload: authedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
                currentUploadId: z.string().nullish(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { videoId, currentUploadId } = input;

            if (!!currentUploadId) {
                const check = await mux.video.uploads.retrieve(currentUploadId);
                if (check.status === "waiting" || check.status === "asset_created") {
                    console.log("Existing upload found");
                    return {
                        url: check.url,
                    };
                }
            }

            console.log("Creating new upload");

            const upload = await mux.video.uploads.create({
                new_asset_settings: {
                    passthrough: user.id,
                    playback_policy: ["public"],
                    input: [
                        {
                            language_code: "en",
                            name: "English",
                            generated_subtitles: [
                                {
                                    language_code: "en",
                                    name: "English",
                                },
                            ],
                        },
                    ],
                },
                cors_origin: "*", // TODO: Set this to the actual origin in production
            });

            if (!upload.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            await db.update(videosTable).set({ muxUploadId: upload.id }).where(eq(videosTable.id, videoId)).returning();

            return {
                url: upload.url,
            };
        }),
    create: authedProcedure.mutation(async ({ ctx }) => {
        const { user } = ctx;

        const [video] = await db
            .insert(videosTable)
            .values({
                userId: user.id,
                title: "Untitled",
                muxStatus: MuxStatus.Waiting,
            })
            .returning();

        return video;
    }),
    update: authedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
        const { user } = ctx;

        if (!input.id) throw new TRPCError({ code: "BAD_REQUEST", message: "id is required" });

        // TODO Enforce visibility restrictions server-side

        const [updatedVideo] = await db
            .update(videosTable)
            .set({
                title: input.title,
                description: input.description,
                categoryId: input.categoryId,
                visibility: input.visibility,
                updatedAt: new Date(),
            })
            .where(and(eq(videosTable.id, input.id), eq(videosTable.userId, user.id)))
            .returning();

        if (!updatedVideo) throw new TRPCError({ code: "NOT_FOUND" });

        return updatedVideo;
    }),
    delete: authedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { id } = input;

            const [deletedVideo] = await db
                .delete(videosTable)
                .where(and(eq(videosTable.id, id), eq(videosTable.userId, user.id)))
                .returning();

            if (!deletedVideo) throw new TRPCError({ code: "NOT_FOUND" });

            if (!!deletedVideo.muxAssetId) await mux.video.assets.delete(deletedVideo.muxAssetId);

            if (!!deletedVideo.thumbnailKey || !!deletedVideo.previewKey) {
                const utapi = new UTApi();
                const keys = [deletedVideo.thumbnailKey, deletedVideo.previewKey].filter((key) => key !== null);
                await utapi.deleteFiles(keys);
            }

            return deletedVideo;
        }),
    restoreThumbnail: authedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { id } = input;

            const [video] = await db
                .select()
                .from(videosTable)
                .where(and(eq(videosTable.id, id), eq(videosTable.userId, user.id)));

            if (!video) throw new TRPCError({ code: "NOT_FOUND" });

            if (!video.muxPlaybackId)
                throw new TRPCError({ code: "BAD_REQUEST", message: "Video has not been processed" });

            const muxThumbnailUrl = getDefaultMuxThumbnailUrl(video.muxPlaybackId);

            // Upload the thumbnail to UploadThing
            const utapi = new UTApi();
            const thumbnailFile = await utapi.uploadFilesFromUrl(muxThumbnailUrl);

            if (!thumbnailFile.data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            const updatedVideo = await db
                .update(videosTable)
                .set({ thumbnailUrl: thumbnailFile.data.ufsUrl, thumbnailKey: thumbnailFile.data.key })
                .where(and(eq(videosTable.id, id), eq(videosTable.userId, user.id)))
                .returning();

            return video;
        }),
    generateThumbnail: authedProcedure
        .input(z.object({ id: z.string().uuid(), prompt: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            const workflowId = await workflowClient.trigger({
                url: buildWorkflowURL("VideoThumbnail"),
                body: { userId: user.id, videoId: input.id, prompt: input.prompt },
            });

            return workflowId;
        }),
    generateDescription: authedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const { user } = ctx;

        const workflowId = await workflowClient.trigger({
            url: buildWorkflowURL("VideoDescription"),
            body: { userId: user.id, videoId: input.id },
        });

        return workflowId;
    }),
    generateTitle: authedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const { user } = ctx;

        const workflowId = await workflowClient.trigger({
            url: buildWorkflowURL("VideoTitle"),
            body: { userId: user.id, videoId: input.id },
        });

        return workflowId;
    }),
    /* -------------------------------------------------------------------------- */
    /*                                Subscriptions                               */
    /* -------------------------------------------------------------------------- */
    onTitleGenerationStatus: authedProcedure.input(z.object({ workflowId: z.string() })).subscription(async function* ({
        ctx,
        input,
        signal,
    }) {
        const events = await subscribeToEventChannel(`${input.workflowId}:progress`, signal);

        for await (const event of events) {
            yield {
                status: parseVideoEventToStatus(event.data!),
            };
        }
    }),
    onDescriptionGenerationStatus: authedProcedure
        .input(z.object({ workflowId: z.string() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const events = await subscribeToEventChannel(`${input.workflowId}:progress`, signal);

            for await (const event of events) {
                yield {
                    status: parseVideoEventToStatus(event.data!),
                };
            }
        }),
    onThumbnailGenerationStatus: authedProcedure
        .input(z.object({ workflowId: z.string() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const events = await subscribeToEventChannel(`${input.workflowId}:progress`, signal);

            for await (const event of events) {
                yield {
                    status: parseVideoEventToStatus(event.data!),
                };
            }
        }),
    // onTest2: authedProcedure.subscription(async function* ({ ctx, input, signal }) {
    //     const events = await subscribeToEventChannel(`test2`, signal);

    //     for await (const event of events) {
    //         yield {
    //             data: event.data,
    //         };
    //     }
    // }),
    // test: baseProcedure.mutation(async ({ ctx }) => {
    //     // Wait 3 seconds
    //     // await redis.publish("test2", "status");
    //     // await new Promise((resolve) => setTimeout(resolve, 3000));
    //     // await redis.publish("test2", "I AM ANOTHER EVENT 2");
    //     const data = "subscribe,test2,1";

    //     console.log(data.split(","));
    // }),
    // test2: baseProcedure.mutation(async ({ ctx }) => {
    //     await redis.publish("test", "status");
    //     await new Promise((resolve) => setTimeout(resolve, 3000));
    //     await redis.publish("test", "I AM ANOTHER EVENT 2");

    //     return "test2";
    // }),
});

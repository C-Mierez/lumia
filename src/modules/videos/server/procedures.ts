import { and, eq, isNotNull } from "drizzle-orm";
import { ServerSentEventMessage } from "fetch-event-stream";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

import { db } from "@/db";
import { videosTable, videoUpdateSchema } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { cacheEvent, getCachedEvent, publishToEventChannel, subscribeToEventChannel } from "@lib/server/event-channel";
import { mux } from "@lib/server/mux";
import { buildWorkflowURL, workflowClient } from "@lib/server/workflow";
import { getDefaultMuxThumbnailUrl } from "@lib/utils";
import { TRPCError } from "@trpc/server";

import { MuxStatus } from "../constants";
import { buildEventChannelName, VideoEvents, VideoEventStatusMap, VideoProcedures } from "./constants";

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
                    return {
                        url: check.url,
                    };
                }
            }

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

            await db
                .update(videosTable)
                .set({ muxUploadId: upload.id, updatedAt: new Date() })
                .where(eq(videosTable.id, videoId))
                .returning();

            publishToEventChannel(buildEventChannelName(videoId, VideoProcedures.Processing), VideoEvents.Started);

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
        // Video cant be made public if it has not been processed
        const [updatedVideo] = await db
            .update(videosTable)
            .set({
                title: input.title,
                description: input.description,
                categoryId: input.categoryId,
                visibility: input.visibility,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(videosTable.id, input.id),
                    eq(videosTable.userId, user.id),
                    input.visibility === "public" ? isNotNull(videosTable.muxPlaybackId) : undefined,
                ),
            )
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

            const utapi = new UTApi();
            if (!!deletedVideo.thumbnailKey) await utapi.deleteFiles([deletedVideo.thumbnailKey]);
            if (!!deletedVideo.previewKey) await utapi.deleteFiles([deletedVideo.previewKey]);

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
                .set({
                    thumbnailUrl: thumbnailFile.data.ufsUrl,
                    thumbnailKey: thumbnailFile.data.key,
                    updatedAt: new Date(),
                })
                .where(and(eq(videosTable.id, id), eq(videosTable.userId, user.id)))
                .returning();

            return video;
        }),
    generateThumbnail: authedProcedure
        .input(z.object({ videoId: z.string().uuid(), prompt: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            // Check cache for on-going workflow
            const cachedVideoEvent = await getCachedEvent(
                buildEventChannelName(input.videoId, VideoProcedures.GenerateThumbnail),
            );
            if (cachedVideoEvent && cachedVideoEvent !== VideoEvents.Error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Thumbnail generation is already in progress" });
            }

            publishToEventChannel(
                buildEventChannelName(input.videoId, VideoProcedures.GenerateThumbnail),
                VideoEvents.Started,
            );

            await workflowClient.trigger({
                url: buildWorkflowURL("VideoThumbnail"),
                body: { userId: user.id, videoId: input.videoId, prompt: input.prompt },
            });
        }),
    generateDescription: authedProcedure
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            // Check cache for on-going workflow
            const cachedVideoEvent = await getCachedEvent(
                buildEventChannelName(input.videoId, VideoProcedures.GenerateDescription),
            );
            if (cachedVideoEvent && cachedVideoEvent !== VideoEvents.Error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Description generation is already in progress" });
            }

            publishToEventChannel(
                buildEventChannelName(input.videoId, VideoProcedures.GenerateDescription),
                VideoEvents.Started,
            );

            await workflowClient.trigger({
                url: buildWorkflowURL("VideoDescription"),
                body: { userId: user.id, videoId: input.videoId },
            });
        }),
    generateTitle: authedProcedure.input(z.object({ videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const { user } = ctx;

        // Check cache for on-going workflow
        const cachedVideoEvent = await getCachedEvent(
            buildEventChannelName(input.videoId, VideoProcedures.GenerateTitle),
        );
        if (cachedVideoEvent && cachedVideoEvent !== VideoEvents.Error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Title generation is already in progress" });
        }

        publishToEventChannel(buildEventChannelName(input.videoId, VideoProcedures.GenerateTitle), VideoEvents.Started);

        await workflowClient.trigger({
            url: buildWorkflowURL("VideoTitle"),
            body: { userId: user.id, videoId: input.videoId },
        });
    }),
    /* -------------------------------------------------------------------------- */
    /*                                Subscriptions                               */
    /* -------------------------------------------------------------------------- */
    onGenerateTitle: authedProcedure.input(z.object({ videoId: z.string().uuid() })).subscription(async function* ({
        ctx,
        input,
        signal,
    }) {
        const channel = buildEventChannelName(input.videoId, VideoProcedures.GenerateTitle);

        // Subscribe to channel
        const events = await subscribeToEventChannel(channel, signal);

        yield* handleVideoEvents(events, channel);
    }),
    onGenerateDescription: authedProcedure
        .input(z.object({ videoId: z.string().uuid() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const channel = buildEventChannelName(input.videoId, VideoProcedures.GenerateDescription);

            // Subscribe to channel
            const events = await subscribeToEventChannel(channel, signal);

            yield* handleVideoEvents(events, channel);
        }),
    onGenerateThumbnail: authedProcedure.input(z.object({ videoId: z.string().uuid() })).subscription(async function* ({
        ctx,
        input,
        signal,
    }) {
        const channel = buildEventChannelName(input.videoId, VideoProcedures.GenerateThumbnail);

        // Subscribe to channel
        const events = await subscribeToEventChannel(channel, signal);

        yield* handleVideoEvents(events, channel);
    }),
    onVideoProcessing: authedProcedure.input(z.object({ videoId: z.string().uuid() })).subscription(async function* ({
        ctx,
        input,
        signal,
    }) {
        const channel = buildEventChannelName(input.videoId, VideoProcedures.Processing);

        // Subscribe to channel
        const events = await subscribeToEventChannel(channel, signal);

        yield* handleVideoEvents(events, channel);
    }),
});

async function* handleVideoEvents(events: AsyncGenerator<ServerSentEventMessage, void, unknown>, channel: string) {
    // Check latest cached event
    const cachedEvent = await getCachedEvent(channel);

    if (cachedEvent) {
        yield {
            // We can assume that the cached event is a valid VideoEvent
            status: VideoEventStatusMap[cachedEvent as VideoEvents],
        };
    }

    for await (const event of events) {
        const [command, channel, data] = event.data!.split(",");

        if (command !== "message") continue;

        function isVideoEvent(value: string): value is VideoEvents {
            return Object.values(VideoEvents).includes(value as VideoEvents);
        }

        if (!data || !isVideoEvent(data)) continue;

        const status = VideoEventStatusMap[data];

        // Cache the without awaiting
        const toCacheEvent = data === VideoEvents.Finished ? null : data;
        cacheEvent(channel, toCacheEvent).catch((error) => {
            console.error(`Failed to cache status: ${status} for channel: ${channel}`, error);
        });

        yield {
            status: status,
        };
    }
}

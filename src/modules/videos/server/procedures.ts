import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { videosTable, videoUpdateSchema } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { mux } from "@lib/mux";
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
                            generated_subtitles: [
                                {
                                    language_code: "en",
                                    name: "English",
                                },
                                {
                                    language_code: "es",
                                    name: "Español",
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

            return deletedVideo;
        }),
});

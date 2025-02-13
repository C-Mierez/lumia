import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { videosTable, videoUpdateSchema } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { mux } from "@lib/mux";
import { TRPCError } from "@trpc/server";

import { MuxStatus } from "../constants";

export const videosRouter = createTRPCRouter({
    create: authedProcedure.mutation(async ({ ctx }) => {
        const { user } = ctx;

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

        const [video] = await db
            .insert(videosTable)
            .values({
                userId: user.id,
                title: "Untitled",
                muxStatus: MuxStatus.Waiting,
                muxUploadId: upload.id,
            })
            .returning();

        return {
            video,
            url: upload.url,
        };
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

            return deletedVideo;
        }),
});

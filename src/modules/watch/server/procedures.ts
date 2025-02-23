import { eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, videosTable, viewsTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter, maybeAuthedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const watchRouter = createTRPCRouter({
    getOne: baseProcedure.input(z.object({ videoId: z.string().uuid() })).query(async ({ input }) => {
        const { ...videosSelect } = getTableColumns(videosTable);
        const { ...userSelect } = getTableColumns(usersTable);

        const [video] = await db
            .select({
                ...videosSelect,
                user: { ...userSelect },
                views: {
                    count: db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id)),
                },
            })
            .from(videosTable)
            .where(eq(videosTable.id, input.videoId))
            .innerJoin(usersTable, eq(usersTable.id, videosTable.userId));

        if (!video) throw new TRPCError({ code: "NOT_FOUND" });

        if (video.visibility === "private") return null;

        return video;
    }),
    createView: maybeAuthedProcedure
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { maybeUser } = ctx;
            const { videoId } = input;
            // Create a single entry in the views table

            function createAnonymousView() {
                return db
                    .insert(viewsTable)
                    .values({
                        videoId,
                    })
                    .returning();
            }

            function createUserView() {
                return db
                    .insert(viewsTable)
                    .values({
                        userId: maybeUser!.id,
                        videoId,
                    })
                    .returning();
            }

            return maybeUser ? createUserView() : createAnonymousView();
        }),
});

import { and, desc, eq, getTableColumns, isNull, lt, not, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { reactionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input;

            const [existingVideo] = await db.select().from(videosTable).where(eq(videosTable.id, input.videoId));

            if (!existingVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Video not found",
                });
            }

            // For the sake of simplicity, the recommendations algorithm will just look for videos with same category
            // and return them in descending order of updatedAt

            const data = await db
                .select({
                    ...getTableColumns(videosTable),
                    users: { ...getTableColumns(usersTable) },
                    likeCount: db.$count(
                        reactionsTable,
                        and(eq(reactionsTable.videoId, videosTable.id), eq(reactionsTable.reactionType, "like")),
                    ),
                    dislikeCount: db.$count(
                        reactionsTable,
                        and(eq(reactionsTable.videoId, videosTable.id), eq(reactionsTable.reactionType, "dislike")),
                    ),
                    viewCount: db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id)),
                })
                .from(videosTable)
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .where(
                    and(
                        eq(videosTable.visibility, "public"),
                        existingVideo.categoryId
                            ? eq(videosTable.categoryId, existingVideo.categoryId)
                            : isNull(videosTable.categoryId),
                        not(eq(videosTable.id, existingVideo.id)),
                        cursor
                            ? or(
                                  lt(videosTable.updatedAt, cursor.updatedAt),
                                  and(eq(videosTable.updatedAt, cursor.updatedAt), lt(videosTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(videosTable.updatedAt), desc(videosTable.id))
                // Limit + 1 to check if there are more pages
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

            return {
                items,
                nextCursor,
            };
        }),
});

import { and, desc, eq, getTableColumns, ilike, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { reactionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const homeRouter = createTRPCRouter({
    searchMany: baseProcedure
        .input(
            z.object({
                searchQuery: z.string().nullish(),
                searchCategory: z.string().uuid().nullish(),
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ input }) => {
            const { cursor, limit, searchQuery, searchCategory } = input;

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
                .where(
                    and(
                        searchQuery ? ilike(videosTable.title, `%${searchQuery}%`) : undefined,
                        searchCategory ? eq(videosTable.categoryId, searchCategory) : undefined,
                        eq(videosTable.visibility, "public"),
                        cursor
                            ? or(
                                  lt(videosTable.updatedAt, cursor.updatedAt),
                                  and(eq(videosTable.updatedAt, cursor.updatedAt), lt(videosTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
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

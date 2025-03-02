import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { reactionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";

export const playlistsRouter = createTRPCRouter({
    getManyHistory: authedProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        viewedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { user } = ctx;

            const userViewsSQ = db.$with("userViews").as(
                db
                    .select({
                        videoId: viewsTable.videoId,
                        watchedAt: viewsTable.watchedAt,
                    })
                    .from(viewsTable)
                    .where(eq(viewsTable.userId, user.id)),
            );

            const data = await db
                .with(userViewsSQ)
                .select({
                    ...getTableColumns(videosTable),
                    users: { ...getTableColumns(usersTable) },
                    watchedAt: userViewsSQ.watchedAt,
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
                .innerJoin(userViewsSQ, eq(videosTable.id, userViewsSQ.videoId))
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .where(
                    and(
                        eq(videosTable.visibility, "public"),
                        cursor
                            ? or(
                                  lt(userViewsSQ.watchedAt, cursor.viewedAt),
                                  and(eq(userViewsSQ.watchedAt, cursor.viewedAt), lt(videosTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(userViewsSQ.watchedAt), desc(videosTable.id))
                // Limit + 1 to check if there are more pages
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.watchedAt } : null;

            return {
                items,
                nextCursor,
            };
        }),
    getManyLiked: authedProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        reactedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { user } = ctx;

            const userLikesSQ = db.$with("userLikes").as(
                db
                    .select({
                        videoId: reactionsTable.videoId,
                        reactedAt: reactionsTable.reactedAt,
                    })
                    .from(reactionsTable)
                    .where(and(eq(reactionsTable.userId, user.id), eq(reactionsTable.reactionType, "like"))),
            );

            const data = await db
                .with(userLikesSQ)
                .select({
                    ...getTableColumns(videosTable),
                    users: { ...getTableColumns(usersTable) },
                    reactedAt: userLikesSQ.reactedAt,
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
                .innerJoin(userLikesSQ, eq(videosTable.id, userLikesSQ.videoId))
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .where(
                    and(
                        eq(videosTable.visibility, "public"),
                        cursor
                            ? or(
                                  lt(userLikesSQ.reactedAt, cursor.reactedAt),
                                  and(eq(userLikesSQ.reactedAt, cursor.reactedAt), lt(videosTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(userLikesSQ.reactedAt), desc(videosTable.id))
                // Limit + 1 to check if there are more pages
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.id, reactedAt: lastItem.reactedAt } : null;

            return {
                items,
                nextCursor,
            };
        }),
});

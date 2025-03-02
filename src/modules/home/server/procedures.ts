import { and, desc, eq, getTableColumns, ilike, lt, not, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { reactionsTable, subscriptionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { authedProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";

export const homeRouter = createTRPCRouter({
    searchMany: baseProcedure
        .input(
            z.object({
                searchQuery: z.string().nullish(),
                searchCategory: z.string().uuid().nullish(),
                isTrending: z.boolean().nullish(),
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        updatedAt: z.date(),
                        viewCount: z.number().nonnegative(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ input }) => {
            const { cursor, limit, searchQuery, searchCategory, isTrending } = input;

            const viewCountSQ = db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id));

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
                    viewCount: viewCountSQ,
                })
                .from(videosTable)
                .where(
                    and(
                        searchQuery ? ilike(videosTable.title, `%${searchQuery}%`) : undefined,
                        searchCategory ? eq(videosTable.categoryId, searchCategory) : undefined,
                        eq(videosTable.visibility, "public"),
                        isTrending
                            ? cursor
                                ? or(
                                      lt(viewCountSQ, cursor.viewCount),
                                      and(eq(viewCountSQ, cursor.viewCount), lt(videosTable.id, cursor.id)),
                                  )
                                : undefined
                            : cursor
                              ? or(
                                    lt(videosTable.updatedAt, cursor.updatedAt),
                                    and(eq(videosTable.updatedAt, cursor.updatedAt), lt(videosTable.id, cursor.id)),
                                )
                              : undefined,
                    ),
                )
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .orderBy(isTrending ? desc(viewCountSQ) : desc(videosTable.updatedAt), desc(videosTable.id))
                // Limit + 1 to check if there are more pages
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore
                ? { id: lastItem.id, updatedAt: lastItem.updatedAt, viewCount: lastItem.viewCount }
                : null;

            return {
                items,
                nextCursor,
            };
        }),
    searchManySubscriptions: authedProcedure
        .input(
            z.object({
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
        .query(async ({ input, ctx }) => {
            const { cursor, limit, searchCategory } = input;
            const { user } = ctx;

            const subscriptionsSQ = db.$with("subscriptions").as(
                db
                    .select({
                        subscribedToId: subscriptionsTable.subscribedToId,
                    })
                    .from(subscriptionsTable)
                    .where(eq(subscriptionsTable.subscriberId, user.id)),
            );

            const data = await db
                .with(subscriptionsSQ)
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
                        not(eq(videosTable.userId, user.id)),
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
                .innerJoin(subscriptionsSQ, eq(videosTable.userId, subscriptionsSQ.subscribedToId))
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

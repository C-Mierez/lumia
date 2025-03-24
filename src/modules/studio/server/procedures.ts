import { and, count, desc, eq, getTableColumns, lt, or, sum } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { commentsTable, reactionsTable, subscriptionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
    getMany: authedProcedure
        .input(
            z.object({
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
            const { user } = ctx;

            const data = await db
                .select({
                    ...getTableColumns(videosTable),
                    viewsCount: db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id)),
                    commentsCount: db.$count(commentsTable, eq(commentsTable.videoId, videosTable.id)),
                    likesCount: db.$count(
                        reactionsTable,
                        and(eq(reactionsTable.videoId, videosTable.id), eq(reactionsTable.reactionType, "like")),
                    ),
                })
                .from(videosTable)
                .where(
                    and(
                        eq(videosTable.userId, user.id),
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
    getOne: authedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { id } = input;
            const { user } = ctx;

            const [video] = await db
                .select()
                .from(videosTable)
                .where(and(eq(videosTable.id, id), eq(videosTable.userId, user.id)))
                .limit(1);

            if (!video) throw new TRPCError({ code: "NOT_FOUND" });

            return video;
        }),
    getChannelStats: authedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        const userVideosSQ = db.$with("user-videos").as(
            db
                .select({
                    ...getTableColumns(videosTable),
                })
                .from(videosTable)
                .where(eq(videosTable.userId, user.id)),
        );

        const viewsPerVidSQ = db.$with("views-per-video").as(
            db
                .with(userVideosSQ)
                .select({
                    videoId: userVideosSQ.id,
                    viewsCount: count().as("views-count"),
                })
                .from(userVideosSQ)
                .innerJoin(viewsTable, eq(viewsTable.videoId, userVideosSQ.id))
                .groupBy(userVideosSQ.userId, userVideosSQ.id),
        );

        const commentsPerVidSQ = db.$with("comments-per-video").as(
            db
                .with(userVideosSQ)
                .select({
                    videoId: userVideosSQ.id,
                    commentsCount: count().as("comments-count"),
                })
                .from(userVideosSQ)
                .innerJoin(commentsTable, eq(commentsTable.videoId, userVideosSQ.id))
                .groupBy(userVideosSQ.userId, userVideosSQ.id),
        );

        const likesPerVidSQ = db.$with("likes-per-video").as(
            db
                .with(userVideosSQ)
                .select({
                    videoId: userVideosSQ.id,
                    likesCount: count().as("likes-count"),
                })
                .from(userVideosSQ)
                .innerJoin(
                    reactionsTable,
                    and(eq(reactionsTable.videoId, userVideosSQ.id), eq(reactionsTable.reactionType, "like")),
                )
                .groupBy(userVideosSQ.userId, userVideosSQ.id),
        );
        const dislikesPerVidSQ = db.$with("dislikes-per-video").as(
            db
                .with(userVideosSQ)
                .select({
                    videoId: userVideosSQ.id,
                    dislikesCount: count().as("dislikes-count"),
                })
                .from(userVideosSQ)
                .innerJoin(
                    reactionsTable,
                    and(eq(reactionsTable.videoId, userVideosSQ.id), eq(reactionsTable.reactionType, "dislike")),
                )
                .groupBy(userVideosSQ.userId, userVideosSQ.id),
        );

        const videoViewCountSQ = db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id));

        const [[videoStats], [subscribers], [popularVideo]] = await db.batch([
            db
                .with(userVideosSQ, viewsPerVidSQ, commentsPerVidSQ, likesPerVidSQ, dislikesPerVidSQ)
                .select({
                    totalViews: sum(viewsPerVidSQ.viewsCount).mapWith(Number).as("totalViews"),
                    totalComments: sum(commentsPerVidSQ.commentsCount).mapWith(Number).as("totalComments"),
                    totalLikes: sum(likesPerVidSQ.likesCount).mapWith(Number).as("totalLikes"),
                    totalDislikes: sum(dislikesPerVidSQ.dislikesCount).mapWith(Number).as("totalDislikes"),
                })
                .from(userVideosSQ)
                .leftJoin(viewsPerVidSQ, eq(userVideosSQ.id, viewsPerVidSQ.videoId))
                .leftJoin(commentsPerVidSQ, eq(userVideosSQ.id, commentsPerVidSQ.videoId))
                .leftJoin(likesPerVidSQ, eq(userVideosSQ.id, likesPerVidSQ.videoId))
                .leftJoin(dislikesPerVidSQ, eq(userVideosSQ.id, dislikesPerVidSQ.videoId)),
            db
                .select({
                    subscriberCount: count().as("subscriber-count"),
                })
                .from(subscriptionsTable)
                .where(eq(subscriptionsTable.subscribedToId, user.id))
                .groupBy(subscriptionsTable.subscribedToId),
            db
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
                    viewCount: videoViewCountSQ,
                })
                .from(videosTable)
                .where(eq(videosTable.visibility, "public"))
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .orderBy(desc(videoViewCountSQ), desc(videosTable.updatedAt), desc(videosTable.id))
                .limit(1),
        ]);

        if (!videoStats) throw new TRPCError({ code: "NOT_FOUND", message: "Video stats not found" });

        return {
            ...videoStats,
            ...(subscribers ?? { subscriberCount: 0 }),
            video: {
                ...popularVideo,
            },
        };
    }),
    getLatestComments: authedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        const userVideosSQ = db.$with("user-videos").as(
            db
                .select({
                    ...getTableColumns(videosTable),
                })
                .from(videosTable)
                .where(eq(videosTable.userId, user.id)),
        );

        const res = await db
            .with(userVideosSQ)
            .select()
            .from(userVideosSQ)
            .innerJoin(commentsTable, eq(commentsTable.videoId, userVideosSQ.id))
            .innerJoin(usersTable, eq(usersTable.id, commentsTable.userId))
            .orderBy(desc(commentsTable.createdAt), desc(commentsTable.id))
            .limit(3);

        return res;
    }),
});

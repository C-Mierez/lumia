import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
    playlistsTable,
    playlistVideosTable,
    reactionsTable,
    subscriptionsTable,
    usersTable,
    videosTable,
    viewsTable,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter, maybeAuthedProcedure } from "@/trpc/init";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";

export const channelsRouter = createTRPCRouter({
    /* -------------------------------------------------------------------------- */
    /*                                   Channel                                  */
    /* -------------------------------------------------------------------------- */
    getOne: maybeAuthedProcedure
        .input(
            z.object({
                userId: z.string().uuid(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { userId } = input;
            const { maybeUser } = ctx;

            const [channel] = await db
                .select({
                    ...getTableColumns(usersTable),
                    subscriberCount: db.$count(subscriptionsTable, eq(subscriptionsTable.subscribedToId, userId)),
                    videosCount: db.$count(videosTable, eq(videosTable.userId, userId)),
                    viewsCount: sql<number>`COUNT(${viewsTable.videoId})`.as("viewsCount"),
                    isSubscribed: maybeUser
                        ? sql<boolean>`(SELECT EXISTS(SELECT 1 FROM ${subscriptionsTable} WHERE ${subscriptionsTable.subscribedToId} = ${userId} AND ${subscriptionsTable.subscriberId} = ${maybeUser.id}))`.as(
                              "isSubscribed",
                          )
                        : sql<null>`NULL`.as("isSubscribed"),
                    isOwner: maybeUser
                        ? sql<boolean>`(SELECT ${usersTable.id} = ${maybeUser.id})`.as("isOwner")
                        : sql<null>`NULL`.as("isOwner"),
                })
                .from(usersTable)
                .where(and(eq(usersTable.id, userId)))
                .leftJoin(videosTable, eq(usersTable.id, videosTable.userId))
                .leftJoin(viewsTable, eq(videosTable.id, viewsTable.videoId))
                .groupBy(usersTable.id);

            return channel;
        }),
    getManyLatest: baseProcedure
        .input(
            z.object({
                userId: z.string().uuid(),
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
            const { userId, limit, cursor } = input;

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
                .where(and(eq(videosTable.visibility, "public"), eq(videosTable.userId, userId)))
                .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
                .orderBy(desc(videosTable.updatedAt), desc(videosTable.id))
                .limit(limit + 1);

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

            return data.length > 0
                ? {
                      videos: items,
                      nextCursor: nextCursor,
                  }
                : {
                      videos: [],
                      nextCursor: null,
                  };
        }),
    getManyPlaylists: baseProcedure
        .input(
            z.object({
                userId: z.string().uuid(),
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
            const { userId, cursor, limit } = input;

            const firstPlaylistVideoSQ = db.$with("firstPlaylistVideo").as(
                db
                    .select({
                        playlistId: playlistVideosTable.playlistId,
                        minPosition: sql`min(${playlistVideosTable.position})`.as("minPosition"),
                    })
                    .from(playlistVideosTable)
                    .groupBy(playlistVideosTable.playlistId),
            );

            const firstPlaylistVideoThumbnailSQ = db.$with("firstPlaylistVideoThumbnail").as(
                db
                    .with(firstPlaylistVideoSQ)
                    .select({
                        ...getTableColumns(playlistVideosTable),
                        thumbnailUrl: videosTable.thumbnailUrl,
                    })
                    .from(playlistVideosTable)
                    .innerJoin(
                        firstPlaylistVideoSQ,
                        and(
                            eq(playlistVideosTable.playlistId, firstPlaylistVideoSQ.playlistId),
                            eq(playlistVideosTable.position, firstPlaylistVideoSQ.minPosition),
                        ),
                    )
                    .innerJoin(videosTable, eq(playlistVideosTable.videoId, videosTable.id)),
            );

            const data = await db
                .with(firstPlaylistVideoThumbnailSQ)
                .select({
                    ...getTableColumns(playlistsTable),
                    videosCount: db.$count(playlistVideosTable, eq(playlistVideosTable.playlistId, playlistsTable.id)),
                    thumbnailUrl: firstPlaylistVideoThumbnailSQ.thumbnailUrl,
                })
                .from(playlistsTable)
                .leftJoin(
                    firstPlaylistVideoThumbnailSQ,
                    eq(playlistsTable.id, firstPlaylistVideoThumbnailSQ.playlistId),
                )
                .where(
                    and(
                        eq(playlistsTable.userId, userId),

                        cursor
                            ? or(
                                  lt(playlistsTable.updatedAt, cursor.updatedAt),
                                  and(eq(playlistsTable.updatedAt, cursor.updatedAt), lt(videosTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(playlistsTable.updatedAt))
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

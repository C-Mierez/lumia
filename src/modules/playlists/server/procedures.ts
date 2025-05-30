import { and, asc, desc, eq, getTableColumns, gt, gte, lt, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
    playlistInsertSchema,
    playlistsTable,
    playlistUpdateSchema,
    playlistVideosTable,
    reactionsTable,
    usersTable,
    videosTable,
    viewsTable,
} from "@/db/schema";
import { authedProcedure, baseProcedure, createTRPCRouter, maybeAuthedProcedure } from "@/trpc/init";
import { DEFAULT_WATCH_LATER_PLAYLIST_NAME, WATCH_LATER_URL_KEYWORD } from "@lib/constants";
import { TRPCError } from "@trpc/server";

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

    /* -------------------------------------------------------------------------- */
    /*                                  Playlists                                 */
    /* -------------------------------------------------------------------------- */
    createPlaylist: authedProcedure
        .input(
            playlistInsertSchema.extend({
                userId: z.string().uuid().nullish(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;

            const [playlist] = await db
                .insert(playlistsTable)
                .values({
                    name: input.name,
                    userId: user.id,
                    description: input.description,
                })
                .returning();

            return playlist;
        }),
    deletePlaylist: authedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
        const { user } = ctx;
        const { id } = input;

        const [playlist] = await db
            .delete(playlistsTable)
            .where(and(eq(playlistsTable.id, id), eq(playlistsTable.userId, user.id)))
            .returning();

        return playlist;
    }),
    updatePlaylist: authedProcedure.input(playlistUpdateSchema).mutation(async ({ input, ctx }) => {
        const { user } = ctx;

        if (!input.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

        const [playlist] = await db
            .update(playlistsTable)
            .set({
                name: input.name,
                description: input.description,
                updatedAt: new Date(),
            })
            .where(and(eq(playlistsTable.id, input.id), eq(playlistsTable.userId, user.id)))
            .returning();

        return playlist;
    }),
    listPlaylistsForVideo: authedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { user } = ctx;

            const data = await db
                .select({
                    ...getTableColumns(playlistsTable),
                    videosCount: db.$count(playlistVideosTable, eq(playlistVideosTable.playlistId, playlistsTable.id)),
                    hasVideo: sql`(
                        SELECT EXISTS (
                            SELECT 1
                            FROM ${playlistVideosTable}
                            WHERE ${playlistVideosTable.playlistId} = ${playlistsTable.id}
                            AND ${playlistVideosTable.videoId} = ${input.videoId}
                        )
                    )`,
                })
                .from(playlistsTable)
                .where(eq(playlistsTable.userId, user.id))
                .orderBy(desc(playlistsTable.updatedAt));

            return data;
        }),
    getOnePlaylist: maybeAuthedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid().or(z.literal(WATCH_LATER_URL_KEYWORD)),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { maybeUser } = ctx;

            async function getWatchLaterId() {
                // This is only possible if the request is made by an authenticated user
                // 1. The middleware shouldn't allow unauthenticated users to access this endpoint
                // 2. The playlist ID should be {WATCH_LATER_URL_KEYWORD} which is special keyword
                // The {WATCH_LATER_URL_KEYWORD} playlist is the only /playlists/[slug] endpoint that's not accessible by anyone other than the owner (except by sharing the url with its ID, which is intended)
                if (!maybeUser) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

                const [res] = await db
                    .select({ id: playlistsTable.id })
                    .from(playlistsTable)
                    .where(
                        and(
                            eq(playlistsTable.userId, maybeUser.id),
                            eq(playlistsTable.name, DEFAULT_WATCH_LATER_PLAYLIST_NAME),
                        ),
                    )
                    .limit(1);

                return res.id;
            }

            const playlistId =
                input.playlistId === WATCH_LATER_URL_KEYWORD ? await getWatchLaterId() : input.playlistId;

            const latestVideo = db.$with("latest_video").as(
                db
                    .select({
                        ...getTableColumns(playlistVideosTable),
                        thumbnailUrl: videosTable.thumbnailUrl,
                    })
                    .from(playlistVideosTable)
                    .where(eq(playlistVideosTable.playlistId, playlistId))
                    .innerJoin(videosTable, eq(videosTable.id, playlistVideosTable.videoId))
                    .orderBy(asc(playlistVideosTable.position))
                    .limit(1),
            );

            const [data] = await db
                .with(latestVideo)
                .select({
                    ...getTableColumns(playlistsTable),
                    videosCount: db.$count(playlistVideosTable, eq(playlistVideosTable.playlistId, playlistsTable.id)),
                    thumbnailUrl: latestVideo.thumbnailUrl,
                })
                .from(playlistsTable)
                .where(eq(playlistsTable.id, playlistId))
                .leftJoin(latestVideo, eq(latestVideo.playlistId, playlistsTable.id))
                .limit(1);

            return data;
        }),
    getManyPlaylists: authedProcedure
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
            const { user } = ctx;
            const { cursor, limit } = input;

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
                        eq(playlistsTable.userId, user.id),

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

    /* -------------------------------------------------------------------------- */
    /*                                    Video                                   */
    /* -------------------------------------------------------------------------- */
    toggleVideo: authedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid(),
                videoId: z.string().uuid(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;
            const { playlistId, videoId } = input;

            // Verify that the playlist belongs to the user
            const [playlist] = await db
                .select()
                .from(playlistsTable)
                .where(and(eq(playlistsTable.id, playlistId), eq(playlistsTable.userId, user.id)))
                .limit(1);

            if (!playlist) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

            const [existing] = await db
                .select()
                .from(playlistVideosTable)
                .where(and(eq(playlistVideosTable.playlistId, playlistId), eq(playlistVideosTable.videoId, videoId)))
                .limit(1);

            let res = null;
            let didAdd = null;
            if (existing) {
                // If the video is already in the playlist, remove it

                // Delete the video from the playlist
                [res] = await db
                    .delete(playlistVideosTable)
                    .where(
                        and(eq(playlistVideosTable.playlistId, playlistId), eq(playlistVideosTable.videoId, videoId)),
                    )
                    .returning();

                didAdd = false;
            } else {
                // If the video is not in the playlist, add it

                // Get the highest position
                const maxPositionSQ = db.$with("max_position").as(
                    db
                        .select({
                            position: sql`max(${playlistVideosTable.position})`.as("position"),
                        })
                        .from(playlistVideosTable)
                        .where(eq(playlistVideosTable.playlistId, playlistId)),
                );

                // Insert the video at the highest position + 1
                [res] = await db
                    .with(maxPositionSQ)
                    .insert(playlistVideosTable)
                    .values({
                        playlistId: playlistId,
                        videoId: videoId,
                        position: sql`coalesce((select ${maxPositionSQ.position} from ${maxPositionSQ}), 0) + 1`,
                    })
                    .returning();

                didAdd = true;
            }

            if (!res)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to add video to playlist",
                });

            // Update playlist updatedAt
            await db
                .update(playlistsTable)
                .set({
                    updatedAt: new Date(),
                })
                .where(eq(playlistsTable.id, playlistId));

            return { result: res, didAdd };
        }),
    updateVideoPosition: authedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid(),
                videoId: z.string().uuid(),
                toPosition: z.number().min(0),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;
            const { playlistId, videoId } = input;

            // Verify that the playlist belongs to the user
            const [playlist] = await db
                .select()
                .from(playlistsTable)
                .where(and(eq(playlistsTable.id, playlistId), eq(playlistsTable.userId, user.id)))
                .limit(1);

            if (!playlist) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

            const [currentVideo] = await db
                .select({ position: playlistVideosTable.position })
                .from(playlistVideosTable)
                .where(and(eq(playlistVideosTable.playlistId, playlistId), eq(playlistVideosTable.videoId, videoId)));

            if (!currentVideo) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid video ID" });

            if (currentVideo.position === input.toPosition) return currentVideo;

            const isMovingDown = input.toPosition < currentVideo.position;

            // Increase or Decrease the position of the videos between the current and the target position
            await db
                .update(playlistVideosTable)
                .set({
                    position: isMovingDown
                        ? sql`${playlistVideosTable.position} + 1`
                        : sql`${playlistVideosTable.position} - 1`,
                })
                .where(
                    and(
                        eq(playlistVideosTable.playlistId, playlistId),
                        isMovingDown
                            ? and(
                                  gte(playlistVideosTable.position, input.toPosition),
                                  lt(playlistVideosTable.position, currentVideo.position),
                              )
                            : and(
                                  gt(playlistVideosTable.position, currentVideo.position),
                                  lte(playlistVideosTable.position, input.toPosition),
                              ),
                    ),
                )
                .returning();

            // Set the target position
            const [res] = await db
                .update(playlistVideosTable)
                .set({
                    position: input.toPosition,
                })
                .where(and(eq(playlistVideosTable.playlistId, playlistId), eq(playlistVideosTable.videoId, videoId)))
                .returning();

            if (!res) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to update video position" });

            // Update playlist updatedAt
            await db
                .update(playlistsTable)
                .set({
                    updatedAt: new Date(),
                })
                .where(eq(playlistsTable.id, playlistId));

            return res;
        }),
    removeVideo: authedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid(),
                videoId: z.string().uuid(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;
            const { playlistId, videoId } = input;

            // Verify that the playlist belongs to the user
            const [playlist] = await db
                .select()
                .from(playlistsTable)
                .where(and(eq(playlistsTable.id, playlistId), eq(playlistsTable.userId, user.id)))
                .limit(1);

            if (!playlist) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

            // Delete the video from the playlist
            const [res] = await db
                .delete(playlistVideosTable)
                .where(and(eq(playlistVideosTable.playlistId, playlistId), eq(playlistVideosTable.videoId, videoId)))
                .returning();

            if (!res) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to update video position" });

            return res;
        }),
    getVideos: maybeAuthedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid().or(z.literal(WATCH_LATER_URL_KEYWORD)),
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
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input;

            const { maybeUser } = ctx;

            async function getWatchLaterId() {
                // This is only possible if the request is made by an authenticated user
                // 1. The middleware shouldn't allow unauthenticated users to access this endpoint
                // 2. The playlist ID should be {WATCH_LATER_URL_KEYWORD} which is special keyword
                // The {WATCH_LATER_URL_KEYWORD} playlist is the only /playlists/[slug] endpoint that's not accessible by anyone other than the owner (except by sharing the url with its ID, which is intended)
                if (!maybeUser) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid playlist ID" });

                const [res] = await db
                    .select({ id: playlistsTable.id })
                    .from(playlistsTable)
                    .where(
                        and(
                            eq(playlistsTable.userId, maybeUser.id),
                            eq(playlistsTable.name, DEFAULT_WATCH_LATER_PLAYLIST_NAME),
                        ),
                    )
                    .limit(1);

                return res.id;
            }

            const playlistId =
                input.playlistId === WATCH_LATER_URL_KEYWORD ? await getWatchLaterId() : input.playlistId;

            const [playlist] = await db.select().from(playlistsTable).where(eq(playlistsTable.id, playlistId)).limit(1);

            if (!playlist) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid playlist ID",
                });
            }

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
                .innerJoin(
                    playlistVideosTable,
                    and(
                        eq(videosTable.id, playlistVideosTable.videoId),
                        eq(playlistVideosTable.playlistId, playlist.id),
                    ),
                )
                .where(
                    and(
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

            const nextCursor = hasMore
                ? { id: lastItem.id, updatedAt: lastItem.updatedAt, viewCount: lastItem.viewCount }
                : null;

            return {
                items,
                nextCursor,
            };
        }),
});

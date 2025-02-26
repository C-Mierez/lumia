import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
    commentReactionsTable,
    commentsTable,
    reactionEnum,
    reactionsTable,
    subscriptionsTable,
    usersTable,
    videosTable,
    viewsTable,
} from "@/db/schema";
import { authedProcedure, createTRPCRouter, maybeAuthedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const watchRouter = createTRPCRouter({
    getOne: maybeAuthedProcedure.input(z.object({ videoId: z.string().uuid() })).query(async ({ ctx, input }) => {
        const { maybeUser } = ctx;
        const { ...videosSelect } = getTableColumns(videosTable);
        const { ...userSelect } = getTableColumns(usersTable);

        const currentUserReactionsSQ = db.$with("current_user_reaction").as(
            db
                .select({
                    videoId: reactionsTable.videoId,
                    type: reactionsTable.reactionType,
                })
                .from(reactionsTable)
                .where(inArray(reactionsTable.userId, maybeUser ? [maybeUser.id] : [])),
        );

        const currentUserSubscriptionsSQ = db.$with("current_user_subscription").as(
            db
                .select()
                .from(subscriptionsTable)
                .where(inArray(subscriptionsTable.subscriberId, maybeUser ? [maybeUser.id] : [])),
        );

        const [video] = await db
            .with(currentUserReactionsSQ, currentUserSubscriptionsSQ)
            .select({
                ...videosSelect,
                user: {
                    ...userSelect,
                    subscriberCount: db.$count(
                        subscriptionsTable,
                        eq(subscriptionsTable.subscribedToId, usersTable.id),
                    ),
                },
                views: {
                    count: db.$count(viewsTable, eq(viewsTable.videoId, videosTable.id)),
                },
                reactions: {
                    likesCount: db.$count(
                        reactionsTable,
                        and(eq(reactionsTable.videoId, videosTable.id), eq(reactionsTable.reactionType, "like")),
                    ),
                    dislikesCount: db.$count(
                        reactionsTable,
                        and(eq(reactionsTable.videoId, videosTable.id), eq(reactionsTable.reactionType, "dislike")),
                    ),
                },
                currentUserReaction: currentUserReactionsSQ.type,
                currentUserSubscription: isNotNull(currentUserSubscriptionsSQ.subscriberId).mapWith(Boolean),
            })
            .from(videosTable)
            .where(eq(videosTable.id, input.videoId))
            .innerJoin(usersTable, eq(usersTable.id, videosTable.userId))
            .leftJoin(currentUserReactionsSQ, eq(currentUserReactionsSQ.videoId, videosTable.id))
            .leftJoin(currentUserSubscriptionsSQ, eq(currentUserSubscriptionsSQ.subscribedToId, usersTable.id));
        // .groupBy(videosTable.id, usersTable.id, currentUserReactionsSQ.type);

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
    createReaction: authedProcedure
        .input(z.object({ videoId: z.string().uuid(), reaction: z.enum(reactionEnum.enumValues) }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { videoId, reaction } = input;

            // Check if the user has already reacted to the video
            const [existingReaction] = await db
                .select()
                .from(reactionsTable)
                .where(and(eq(reactionsTable.userId, user.id), eq(reactionsTable.videoId, videoId)));

            if (existingReaction) {
                if (existingReaction.reactionType === reaction) {
                    // Delete the existing reaction
                    const [deleted] = await db
                        .delete(reactionsTable)
                        .where(and(eq(reactionsTable.userId, user.id), eq(reactionsTable.videoId, videoId)))
                        .returning();

                    if (!deleted) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

                    return null;
                } else {
                    // Update the existing reaction
                    const [updatedReaction] = await db
                        .update(reactionsTable)
                        .set({
                            reactionType: reaction,
                        })
                        .where(and(eq(reactionsTable.userId, user.id), eq(reactionsTable.videoId, videoId)))
                        .returning();

                    if (!updatedReaction) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

                    return updatedReaction;
                }
            }

            // Create a single entry in the reactions table
            const [entry] = await db
                .insert(reactionsTable)
                .values({
                    userId: user.id,
                    videoId,
                    reactionType: reaction,
                })
                .returning();

            if (!entry) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            return entry;
        }),
    createComment: authedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
                parentId: z.number().nullish(),
                text: z.string().nonempty(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { videoId, text, parentId } = input;

            // Enforce only one level of nesting
            if (parentId) {
                const [parentComment] = await db
                    .select()
                    .from(commentsTable)
                    .where(and(eq(commentsTable.id, parentId), eq(commentsTable.videoId, videoId)));

                if (!parentComment) throw new TRPCError({ code: "NOT_FOUND" });

                if (parentComment.parentId) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Only one level of nesting is allowed" });
                }
            }

            // Create a single entry in the comments table
            const [entry] = await db
                .insert(commentsTable)
                .values({
                    userId: user.id,
                    videoId,
                    parentId,
                    text,
                })
                .returning();

            if (!entry) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            return entry;
        }),
    getManyComments: maybeAuthedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
                parentId: z.number().nullish(),
                cursor: z
                    .object({
                        id: z.number().positive(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { maybeUser } = ctx;
            const { videoId, cursor, limit } = input;

            const currentUserReactionsSQ = db.$with("current_user_reaction").as(
                db
                    .select({
                        commentId: commentReactionsTable.commentId,
                        videoId: commentReactionsTable.videoId,
                        type: commentReactionsTable.reactionType,
                    })
                    .from(commentReactionsTable)
                    .where(
                        and(
                            eq(commentReactionsTable.videoId, videoId),
                            inArray(commentReactionsTable.userId, maybeUser ? [maybeUser.id] : []),
                        ),
                    ),
            );

            const commentRepliesSQ = db.$with("comment_replies").as(
                db
                    .select({
                        parentId: commentsTable.parentId,
                        count: count(commentsTable.id).as("count"),
                    })
                    .from(commentsTable)
                    .where(isNotNull(commentsTable.parentId))
                    .groupBy(commentsTable.parentId),
            );

            const comments = await db
                .with(currentUserReactionsSQ, commentRepliesSQ)
                .select({
                    comments: { ...getTableColumns(commentsTable) },
                    users: { ...getTableColumns(usersTable) },
                    totalComments: db.$count(commentsTable, eq(commentsTable.videoId, videoId)),
                    reactions: {
                        likesCount: db.$count(
                            commentReactionsTable,
                            and(
                                eq(commentReactionsTable.videoId, videoId),
                                eq(commentReactionsTable.commentId, commentsTable.id),
                                eq(commentReactionsTable.reactionType, "like"),
                            ),
                        ),
                        dislikesCount: db.$count(
                            commentReactionsTable,
                            and(
                                eq(commentReactionsTable.videoId, videoId),
                                eq(commentReactionsTable.commentId, commentsTable.id),
                                eq(commentReactionsTable.reactionType, "dislike"),
                            ),
                        ),
                        repliesCount: commentRepliesSQ.count,
                    },
                    currentUserReaction: currentUserReactionsSQ.type,
                })
                .from(commentsTable)
                .where(
                    and(
                        eq(commentsTable.videoId, videoId),
                        // If no parentId  is provided, only fetch root comments
                        // Otherwise, fetch replies to the provided parentId
                        input.parentId ? eq(commentsTable.parentId, input.parentId) : isNull(commentsTable.parentId),
                        cursor
                            ? or(
                                  lt(commentsTable.updatedAt, cursor.updatedAt),
                                  and(eq(commentsTable.updatedAt, cursor.updatedAt), lt(commentsTable.id, cursor.id)),
                              )
                            : undefined,
                    ),
                )
                .innerJoin(usersTable, eq(usersTable.id, commentsTable.userId))
                .leftJoin(
                    currentUserReactionsSQ,
                    and(
                        eq(currentUserReactionsSQ.commentId, commentsTable.id),
                        eq(currentUserReactionsSQ.videoId, videoId),
                    ),
                )
                .leftJoin(commentRepliesSQ, eq(commentRepliesSQ.parentId, commentsTable.id))
                .orderBy(desc(commentsTable.updatedAt), desc(commentsTable.id))
                .limit(limit + 1);

            const hasMore = comments.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? comments.slice(0, -1) : comments;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.comments.id, updatedAt: lastItem.comments.updatedAt } : null;

            return { comments, nextCursor };
        }),
    deleteComment: authedProcedure
        .input(z.object({ commentId: z.number().positive() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { commentId } = input;

            // Create a single entry in the comments table
            const [deletedComment] = await db
                .delete(commentsTable)
                .where(and(eq(commentsTable.userId, user.id), eq(commentsTable.id, commentId)))
                .returning();

            if (!deletedComment) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            return deletedComment;
        }),
    createCommentReaction: authedProcedure
        .input(
            z.object({
                commentId: z.number().positive(),
                videoId: z.string().uuid(),
                reaction: z.enum(reactionEnum.enumValues),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { videoId, reaction } = input;

            // Check if the user has already reacted to the video
            const [existingReaction] = await db
                .select()
                .from(commentReactionsTable)
                .where(
                    and(
                        eq(commentReactionsTable.userId, user.id),
                        eq(commentReactionsTable.videoId, videoId),
                        eq(commentReactionsTable.commentId, input.commentId),
                    ),
                );

            if (existingReaction) {
                if (existingReaction.reactionType === reaction) {
                    // Delete the existing reaction
                    const [deleted] = await db
                        .delete(commentReactionsTable)
                        .where(
                            and(
                                eq(commentReactionsTable.userId, user.id),
                                eq(commentReactionsTable.videoId, videoId),
                                eq(commentReactionsTable.commentId, input.commentId),
                            ),
                        )
                        .returning();

                    if (!deleted) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

                    return null;
                } else {
                    // Update the existing reaction
                    const [updatedReaction] = await db
                        .update(commentReactionsTable)
                        .set({
                            reactionType: reaction,
                        })
                        .where(
                            and(
                                eq(commentReactionsTable.userId, user.id),
                                eq(commentReactionsTable.videoId, videoId),
                                eq(commentReactionsTable.commentId, input.commentId),
                            ),
                        )
                        .returning();

                    if (!updatedReaction) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

                    return updatedReaction;
                }
            }

            // Create a single entry in the reactions table
            const [entry] = await db
                .insert(commentReactionsTable)
                .values({
                    userId: user.id,
                    videoId,
                    commentId: input.commentId,
                    reactionType: reaction,
                })
                .returning();

            if (!entry) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            return entry;
        }),
});

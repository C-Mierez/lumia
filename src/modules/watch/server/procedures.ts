import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { reactionEnum, reactionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
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

        const [video] = await db
            .with(currentUserReactionsSQ)
            .select({
                ...videosSelect,
                user: { ...userSelect },
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
            })
            .from(videosTable)
            .where(eq(videosTable.id, input.videoId))
            .innerJoin(usersTable, eq(usersTable.id, videosTable.userId))
            .leftJoin(currentUserReactionsSQ, eq(currentUserReactionsSQ.videoId, videosTable.id));
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
});

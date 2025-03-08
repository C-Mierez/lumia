import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { subscriptionsTable, usersTable } from "@/db/schema";
import { authedProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = createTRPCRouter({
    createSubscription: authedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            if (input.userId === user.id) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "You can't subscribe to yourself" });
            }

            const [subscription] = await db
                .insert(subscriptionsTable)
                .values({
                    subscriberId: user.id,
                    subscribedToId: input.userId,
                })
                .returning();

            if (!subscription) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "You are already subscribed to this user" });
            }

            return subscription;
        }),
    deleteSubscription: authedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            const [deleted] = await db
                .delete(subscriptionsTable)
                .where(
                    and(
                        eq(subscriptionsTable.subscriberId, user.id),
                        eq(subscriptionsTable.subscribedToId, input.userId),
                    ),
                )
                .returning();

            if (!deleted) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "You are not subscribed to this user" });
            }

            return deleted;
        }),
    getMany: authedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        const subscriptions = await db
            .select({
                ...getTableColumns(usersTable),
                subscribedAt: subscriptionsTable.subscribedAt,
            })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.subscriberId, user.id))
            .innerJoin(usersTable, eq(subscriptionsTable.subscribedToId, usersTable.id));

        if (!subscriptions) {
            return [];
        }

        return subscriptions;
    }),
    getSubscribers: baseProcedure
        .input(
            z.object({
                userId: z.string().uuid(),
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        subscribedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1),
            }),
        )
        .query(async ({ input }) => {
            const { userId, cursor, limit } = input;

            const data = await db
                .select({
                    ...getTableColumns(usersTable),
                    subscribedAt: subscriptionsTable.subscribedAt,
                    totalSubscribers: db.$count(subscriptionsTable, eq(subscriptionsTable.subscribedToId, userId)),
                })
                .from(subscriptionsTable)
                .innerJoin(usersTable, eq(subscriptionsTable.subscriberId, usersTable.id))
                .where(
                    and(
                        eq(subscriptionsTable.subscribedToId, userId),
                        cursor
                            ? or(
                                  lt(subscriptionsTable.subscribedAt, cursor.subscribedAt),
                                  and(
                                      eq(subscriptionsTable.subscribedAt, cursor.subscribedAt),
                                      lt(usersTable.id, cursor.id),
                                  ),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(subscriptionsTable.subscribedAt))
                .limit(limit + 1);

            if (!data) {
                return {
                    items: [],
                    nextCursor: null,
                };
            }

            const hasMore = data.length > limit;

            // Remove the extra item if more data is available
            const items = hasMore ? data.slice(0, -1) : data;

            // Set the cursor to the real last item
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? { id: lastItem.id, subscribedAt: lastItem.subscribedAt } : null;

            return {
                items,
                nextCursor,
            };
        }),
});

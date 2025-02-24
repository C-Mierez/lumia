import { db } from "@/db";
import { subscriptionsTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

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
});

import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { subscriptionsTable, usersTable, videosTable, viewsTable } from "@/db/schema";
import { createTRPCRouter, maybeAuthedProcedure } from "@/trpc/init";

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
});

import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
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
                .select()
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
});

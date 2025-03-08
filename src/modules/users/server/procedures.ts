import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
    removeBanner: authedProcedure.mutation(async ({ input, ctx }) => {
        const { user } = ctx;

        // Remove the file from Uploadthing
        const utapi = new UTApi();
        if (user.bannerKey) await utapi.deleteFiles([user.bannerKey]);

        // Delete the banner from db
        const [res] = await db
            .update(usersTable)
            .set({
                bannerUrl: null,
                bannerKey: null,
            })
            .where(eq(usersTable.id, user.id))
            .returning();

        if (!res)
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });

        return res;
    }),
});

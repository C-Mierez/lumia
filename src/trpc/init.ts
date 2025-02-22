import { cache } from "react";

import { eq } from "drizzle-orm";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";

export const createTRPCContext = cache(async () => {
    /**
     * @see: https://trpc.io/docs/server/context
     */

    const clerkAuth = await auth();

    return { clerkAuth };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;

export const authedProcedure = t.procedure.use(async (opts) => {
    const { ctx } = opts;

    // Check session has a valid user
    if (!ctx.clerkAuth.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Check that user exists in the database, and attach to context
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, ctx.clerkAuth.userId)).limit(1);

    if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
        ctx: {
            ...ctx,
            user,
        },
    });
});

import { z } from "zod";

import { authedProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
    hello: authedProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query((opts) => {
            return {
                greeting: `hello ${opts.ctx.user.name}`,
            };
        }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

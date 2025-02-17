import { on } from "stream";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { TestEE, TestEvent } from "./events";

export const testRouter = createTRPCRouter({
    createMany: baseProcedure.mutation(async () => {
        // Emit events
        for (let i = 0; i < 10; i++) {
            TestEE.emit("create", `id-${i}`, { title: `title-${i}`, content: `content-${i}` });

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return true;
    }),

    onCreate: baseProcedure.subscription(async function* ({ ctx, signal }) {
        const iterable = TestEE.toIterable("create", { signal });
        // Listen for new events
        for await (const [id, data] of iterable) {
            yield { id, data };
        }
    }),
});

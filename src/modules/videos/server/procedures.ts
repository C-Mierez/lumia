import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";

export const videosRouter = createTRPCRouter({
    create: authedProcedure.mutation(async ({ ctx }) => {
        const { user } = ctx;

        const [video] = await db
            .insert(videosTable)
            .values({
                userId: user.id,
                title: "Untitled",
            })
            .returning();

        return {
            video,
        };
    }),
});

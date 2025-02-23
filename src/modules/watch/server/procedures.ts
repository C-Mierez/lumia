import { eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, videosTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const watchRouter = createTRPCRouter({
    getOne: baseProcedure.input(z.object({ videoId: z.string().uuid() })).query(async ({ input }) => {
        const { ...videosSelect } = getTableColumns(videosTable);
        const { ...userSelect } = getTableColumns(usersTable);

        const [video] = await db
            .select({
                ...videosSelect,
                user: { ...userSelect },
            })
            .from(videosTable)
            .where(eq(videosTable.id, input.videoId))
            .innerJoin(usersTable, eq(usersTable.id, videosTable.userId));

        if (!video) throw new TRPCError({ code: "NOT_FOUND" });

        if (video.visibility === "private") return null;

        return video;
    }),
});

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const watchRouter = createTRPCRouter({
    getOne: baseProcedure.input(z.object({ videoId: z.string().uuid() })).query(async ({ input }) => {
        const [video] = await db.select().from(videosTable).where(eq(videosTable.id, input.videoId));

        if (!video) throw new TRPCError({ code: "NOT_FOUND" });

        if (video.visibility === "private") return null;

        return video;
    }),
});

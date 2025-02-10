import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { authedProcedure, createTRPCRouter } from "@/trpc/init";
import { mux } from "@lib/mux";
import { MuxStatus } from "../constants";

export const videosRouter = createTRPCRouter({
    create: authedProcedure.mutation(async ({ ctx }) => {
        const { user } = ctx;

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: user.id,
                playback_policy: ["public"],
            },
            cors_origin: "*", // TODO: Set this to the actual origin in production
        });

        const [video] = await db
            .insert(videosTable)
            .values({
                userId: user.id,
                title: "Untitled",
                muxStatus: MuxStatus.Waiting,
                muxUploadId: upload.id,
            })
            .returning();

        return {
            video,
            url: upload.url,
        };
    }),
});

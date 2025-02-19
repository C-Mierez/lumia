import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, videosTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    thumbnailUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .input(
            z.object({
                videoId: z.string().uuid(),
            }),
        )
        .middleware(async ({ input }) => {
            const { videoId } = input;
            const clerk = await auth();

            if (!clerk.userId) throw new UploadThingError("Unauthorized");

            const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerk.userId));

            if (!user) throw new UploadThingError("User not found");

            // Delete all files from Uploadthing for this user and video before uploading a new one, if they exist
            const [video] = await db
                .select()
                .from(videosTable)
                .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, user.id)));

            if (!!video.thumbnailKey) {
                const utapi = new UTApi();
                await utapi.deleteFiles([video.thumbnailKey]);
            }

            return { user, ...input };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            await db
                .update(videosTable)
                .set({ thumbnailUrl: file.ufsUrl, thumbnailKey: file.key })
                .where(and(eq(videosTable.id, metadata.videoId), eq(videosTable.userId, metadata.user.id)));

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.user.id };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

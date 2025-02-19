import { and, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { publishToEventChannel } from "@lib/server/event-channel";
import { getDefaultMuxPreviewUrl, getDefaultMuxThumbnailUrl } from "@lib/utils";
import { buildEventChannelName, VideoEvents, VideoProcedures } from "@modules/videos/server/constants";
import { VideoAssetReadyWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import { serve } from "@upstash/workflow/nextjs";

type InputType = {
    data: VideoAssetReadyWebhookEvent["data"];
    playbackId: string;
};

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/asset-ready");
    const { POST: handler } = serve<InputType>(
        async (context) => {
            const input = context.requestPayload;
            const { data, playbackId } = input;

            const [thumbnailFile, previewFile] = await context.run("upload-thumbnail-and-preview", async () => {
                const muxThumbnailUrl = getDefaultMuxThumbnailUrl(playbackId);
                const muxPreviewUrl = getDefaultMuxPreviewUrl(playbackId);

                // Upload the thumbnail and preview to UploadThing
                const utapi = new UTApi();
                const [thumbnailFile, previewFile] = await utapi.uploadFilesFromUrl([muxThumbnailUrl, muxPreviewUrl]);

                if (!thumbnailFile.data || !previewFile.data) {
                    // Delete the thumbnail and preview from UploadThing
                    if (thumbnailFile.data) await utapi.deleteFiles([thumbnailFile.data.key]);
                    if (previewFile.data) await utapi.deleteFiles([previewFile.data.key]);
                    throw new Error("Failed to upload thumbnail or preview");
                }

                return [thumbnailFile, previewFile];
            });

            const a = await context.run("update-video", async () => {
                const duration = data.duration ? Math.floor(data.duration * 1000) : 0;

                // Update the video in the database
                const [video] = await db
                    .update(videosTable)
                    .set({
                        muxStatus: data.status,
                        muxPlaybackId: playbackId,
                        previewUrl: previewFile.data.ufsUrl,
                        previewKey: previewFile.data.key,
                        duration,
                    })
                    .where(eq(videosTable.muxUploadId, data.upload_id!))
                    .returning();

                if (!video) throw new Error("Video not found");

                // Update the thumbnail only if it's null
                await db
                    .update(videosTable)
                    .set({
                        thumbnailUrl: thumbnailFile.data.ufsUrl,
                        thumbnailKey: thumbnailFile.data.key,
                    })
                    .where(and(eq(videosTable.muxUploadId, data.upload_id!), isNull(videosTable.thumbnailKey)));

                await publishToEventChannel(
                    buildEventChannelName(video.id, VideoProcedures.Processing),
                    VideoEvents.MuxAssetReady,
                );
            });
        },
        {
            failureFunction: async ({ context, failStatus, failResponse, failHeaders }) => {
                console.error("Failed to process video description workflow", failResponse);
            },
        },
    );

    return await handler(request);
};

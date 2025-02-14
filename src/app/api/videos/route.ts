import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { env } from "@/env";
import { mux } from "@lib/mux";
import type {
    VideoAssetCreatedWebhookEvent,
    VideoAssetDeletedWebhookEvent,
    VideoAssetErroredWebhookEvent,
    VideoAssetReadyWebhookEvent,
    VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";

type WebhookEvent =
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetTrackReadyWebhookEvent
    | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");

    if (!muxSignature) return new Response("No Upload ID received", { status: 400 });

    const payload = await request.json();
    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
        body,
        {
            "mux-signature": muxSignature,
        },
        env.MUX_WEBHOOK_SECRET,
    );

    console.log("Webhook received", payload.type as WebhookEvent["type"]);

    switch (payload.type as WebhookEvent["type"]) {
        case "video.asset.created": {
            // Insert the muxAssetId and muxStatus into the database
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            await db
                .update(videosTable)
                .set({
                    muxAssetId: data.id,
                    muxStatus: data.status,
                })
                .where(eq(videosTable.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.ready": {
            // Update the muxStatus to ready in the database
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];
            const playbackId = data.playback_ids?.[0].id; // This should always exist when the "ready" event is received

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });
            if (!data.playback_ids || !playbackId) return new Response("No Playback ID found", { status: 400 });

            const muxThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
            const muxPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

            const duration = data.duration ? Math.floor(data.duration * 1000) : 0;

            // Upload the thumbnail and preview to UploadThing
            const utapi = new UTApi();
            const [thumbnailFile, previewFile] = await utapi.uploadFilesFromUrl([muxThumbnailUrl, muxPreviewUrl]);

            if (!thumbnailFile.data || !previewFile.data)
                return new Response("Failed to upload thumbnail or preview", { status: 500 });

            // Update the video in the database
            await db.batch([
                db
                    .update(videosTable)
                    .set({
                        muxStatus: data.status,
                        muxPlaybackId: playbackId,
                        muxAssetId: data.id,
                        previewUrl: previewFile.data.ufsUrl,
                        previewKey: previewFile.data.key,
                        duration,
                    })
                    .where(eq(videosTable.muxUploadId, data.upload_id!)),

                // Update the thumbnail only if it's null
                db
                    .update(videosTable)
                    .set({
                        thumbnailUrl: thumbnailFile.data.ufsUrl,
                        thumbnailKey: thumbnailFile.data.key,
                    })
                    .where(and(eq(videosTable.muxUploadId, data.upload_id!), isNull(videosTable.thumbnailKey))),
            ]);

            break;
        }
        case "video.asset.errored": {
            // Update the muxStatus to failed in the database
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            await db
                .update(videosTable)
                .set({
                    muxStatus: data.status,
                })
                .where(eq(videosTable.muxUploadId, data.upload_id));

            break;
        }
        case "video.asset.deleted": {
            // Delete the video from the database
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            const [video] = await db.delete(videosTable).where(eq(videosTable.muxUploadId, data.upload_id)).returning();

            if (!video) return new Response("Video not found", { status: 404 });

            // Delete the thumbnail and preview from UploadThing
            const utapi = new UTApi();
            const keys = [video.thumbnailKey, video.previewKey].filter((key) => key !== null);
            await utapi.deleteFiles(keys);

            break;
        }
        case "video.asset.track.ready": {
            // Update the muxTrackId and muxTrackStatus in the database
            // This event is only received when the video has a track
            const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & { asset_id: string }; // This should always exist when the "track_ready" event is received

            if (!data.asset_id) return new Response("No Asset ID found", { status: 400 });

            await db
                .update(videosTable)
                .set({
                    muxTrackId: data.id,
                    muxTrackStatus: data.status,
                })
                .where(eq(videosTable.muxAssetId, data.asset_id));

            break;
        }
    }

    return new Response("Webhook received", { status: 200 });
};

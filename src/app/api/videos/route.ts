import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { env } from "@/env";
import { publishToEventChannel } from "@lib/server/event-channel";
import { mux } from "@lib/server/mux";
import { buildWorkflowURL, workflowClient } from "@lib/server/workflow";
import { buildEventChannelName, VideoEvents, VideoProcedures } from "@modules/videos/server/constants";
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

    console.log("Mux Webhook received", payload.type as WebhookEvent["type"]);

    switch (payload.type as WebhookEvent["type"]) {
        case "video.asset.created": {
            // Insert the muxAssetId and muxStatus into the database
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            const [video] = await db
                .update(videosTable)
                .set({
                    muxAssetId: data.id,
                    muxStatus: data.status,
                })
                .where(eq(videosTable.muxUploadId, data.upload_id))
                .returning();

            if (!video) return new Response("Video not found", { status: 404 });

            publishToEventChannel(
                buildEventChannelName(video.id, VideoProcedures.Processing),
                VideoEvents.MuxAssetCreated,
            );
            break;
        }
        case "video.asset.ready": {
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];

            const playbackId = data.playback_ids?.[0].id; // This should always exist when the "ready" event is received
            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });
            if (!data.playback_ids || !playbackId) return new Response("No Playback ID found", { status: 400 });

            // Verify that the video has not been processed as ready yet
            // Set the playback ID otherwise
            const [video] = await db
                .update(videosTable)
                .set({ muxPlaybackId: playbackId })
                .where(and(eq(videosTable.muxAssetId, data.id), isNull(videosTable.muxPlaybackId)))
                .returning();

            if (!video) return new Response("Video already processed", { status: 202 });

            await workflowClient.trigger({
                url: buildWorkflowURL("VideoAssetReady"),
                body: {
                    playbackId,
                    data,
                    thumbnailKey: video.thumbnailKey,
                },
            });

            break;
        }
        case "video.asset.errored": {
            // Update the muxStatus to failed in the database
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            const [video] = await db
                .update(videosTable)
                .set({
                    muxStatus: data.status,
                })
                .where(eq(videosTable.muxUploadId, data.upload_id))
                .returning();

            if (!video) return new Response("Video not found", { status: 404 });

            publishToEventChannel(
                buildEventChannelName(video.id, VideoProcedures.Processing),
                VideoEvents.MuxAssetErrored,
            );

            break;
        }
        case "video.asset.deleted": {
            // Delete the video from the database
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

            if (!data.upload_id) return new Response("No Upload ID found", { status: 400 });

            const [video] = await db.delete(videosTable).where(eq(videosTable.muxUploadId, data.upload_id)).returning();

            if (!video) return new Response("Video not found", { status: 202 });

            // Delete the thumbnail and preview from UploadThing
            const utapi = new UTApi();
            const keys = [video.thumbnailKey, video.previewKey].filter((key) => key !== null);
            await utapi.deleteFiles(keys);

            publishToEventChannel(
                buildEventChannelName(video.id, VideoProcedures.Processing),
                VideoEvents.MuxAssetDeleted,
            );

            break;
        }
        case "video.asset.track.ready": {
            // Update the muxTrackId and muxTrackStatus in the database
            // This event is only received when the video has a track
            const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & { asset_id: string }; // This should always exist when the "track_ready" event is received

            if (!data.asset_id) return new Response("No Asset ID found", { status: 400 });

            const [video] = await db
                .update(videosTable)
                .set({
                    muxTrackId: data.id,
                    muxTrackStatus: data.status,
                })
                .where(eq(videosTable.muxAssetId, data.asset_id))
                .returning();

            if (!video) return new Response("Video not found", { status: 404 });

            publishToEventChannel(
                buildEventChannelName(video.id, VideoProcedures.Processing),
                VideoEvents.MuxAssetTrackReady,
            );

            break;
        }
    }

    return new Response("Webhook received", { status: 200 });
};

import { stream } from "fetch-event-stream";

import { env } from "@/env";

import { GeneralEvents, VideoEvents, VideoStatus } from "./events";
import { redis } from "./redis";

export function parseVideoEventToStatus(event: string) {
    // Parse event-stream response
    const [command, channel, data] = event.split(",");

    if (command !== "message") return null;

    switch (data) {
        case VideoEvents.GetVideo:
            return VideoStatus.GetVideo;
        case VideoEvents.GenerateTile:
            return VideoStatus.GenerateTile;
        case VideoEvents.GenerateDescription:
            return VideoStatus.GenerateDescription;
        case VideoEvents.GenerateThumbnail:
            return VideoStatus.GenerateThumbnail;
        case VideoEvents.GetTranscript:
            return VideoStatus.GetTranscript;
        case VideoEvents.UpdateVideo:
            return VideoStatus.UpdateVideo;
        case VideoEvents.GeneratePrompt:
            return VideoStatus.GeneratePrompt;
        case VideoEvents.CleanUp:
            return VideoStatus.CleanUp;
        case GeneralEvents.Finished:
            return VideoStatus.Finished;
        default:
            return null;
    }
}

export async function subscribeToEventChannel(channel: string, signal?: AbortSignal) {
    /**
     * Manually send an HTTP request to the REDIS API subscribe endpoint
     * curl -X POST https://us1-merry-cat-32748.upstash.io/subscribe/chat \
     * -H "Authorization: Bearer 2553feg6a2d9842h2a0gcdb5f8efe9934" \
     * -H "Accept:text/event-stream"
     */

    const events = await stream(`${env.KV_REST_API_URL}/subscribe/${channel}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.KV_REST_API_TOKEN}`,
            Accept: "text/event-stream",
        },
        signal,
    });
    return events;
}

export async function publishToEventChannel(channel: string, data: string) {
    return await redis.publish(channel, data);
}

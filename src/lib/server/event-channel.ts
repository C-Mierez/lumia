import { stream } from "fetch-event-stream";

import { env } from "@/env";

import { redis } from "./redis";

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

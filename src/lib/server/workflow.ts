import { env } from "@/env";
import { Client } from "@upstash/workflow";

export const workflowClient = new Client({ token: env.QSTASH_TOKEN });

export const WORKFLOW_ENDPOINTS = {
    VideoTitle: "videos/workflows/title",
    VideoDescription: "videos/workflows/description",
    VideoThumbnail: "videos/workflows/thumbnail",
    VideoAssetReady: "videos/workflows/asset-ready",
};

// URL Builder
export function buildWorkflowURL(endpoint: keyof typeof WORKFLOW_ENDPOINTS) {
    return `${env.UPSTASH_WORKFLOW_URL}/api/${WORKFLOW_ENDPOINTS[endpoint]}`;
}

export function buildRedisKey(workflowRunId: string, key: string) {
    return `${workflowRunId}:${key}`;
}

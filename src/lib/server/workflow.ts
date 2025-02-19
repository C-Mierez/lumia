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

// //@ts-expect-error since we had to redeclare the workflowRunId
// export class StepLogger extends WorkflowLogger {
//     //@ts-expect-error since we had to redeclare the workflowRunId
//     protected workflowRunId: string;
//     constructor() {
//         super({ logLevel: "SUBMIT", logOutput: "console" });
//     }
//     async log(
//         level: LogLevel,
//         eventType:
//             | "ERROR"
//             | "ENDPOINT_START"
//             | "SUBMIT_THIRD_PARTY_RESULT"
//             | "CREATE_CONTEXT"
//             | "SUBMIT_FIRST_INVOCATION"
//             | "RUN_SINGLE"
//             | "RUN_PARALLEL"
//             | "SUBMIT_STEP"
//             | "SUBMIT_CLEANUP"
//             | "RESPONSE_WORKFLOW"
//             | "RESPONSE_DEFAULT",
//         details?: unknown,
//     ): Promise<void> {
//         if (level === "SUBMIT" && eventType === "SUBMIT_STEP") {
//             const _details = details as { length: number; steps: Step[] };
//             if (_details.length === 1 && _details.steps.length === 1) {
//                 const step = _details.steps[0];

//                 // Publish the current step to the event channel
//                 await publishToEventChannel(`${this.workflowRunId}:progress`, step.stepName);
//             }
//         }

//         if (level === "SUBMIT" && eventType === "SUBMIT_CLEANUP") {
//             const _details = details as { deletedWorkflowRunId?: string };
//             if (_details.deletedWorkflowRunId) {
//                 // Publish the cleanup event to the event channel
//                 await publishToEventChannel(`${this.workflowRunId}:progress`, GeneralEvents.Finished);
//             }
//         }

//         return;
//     }
// }

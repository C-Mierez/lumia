import { StudioGetOneOutput } from "@/trpc/types";
import { VideoStatus } from "@modules/videos/server/constants";

export function isDisablingStatus(status: string | null) {
    return status !== VideoStatus.Finished && status !== null;
}

export function canGenerateAIContent(video: StudioGetOneOutput) {
    return !!video.muxUploadId && !!video.muxAssetId && !!video.muxPlaybackId;
}

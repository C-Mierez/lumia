export enum VideoProcedures {
    GenerateTitle = "gen-t",
    GenerateDescription = "gen-d",
    GenerateThumbnail = "gen-th",
    Processing = "processing",
}

export enum VideoEvents {
    Started = "started",
    GetVideo = "get-video",
    CleanUp = "clean-up",
    GenerateTitle = "generate-title",
    GenerateDescription = "generate-description",
    GenerateThumbnail = "generate-thumbnail",
    GeneratePrompt = "generate-prompt",
    GetTranscript = "get-transcript",
    UpdateVideo = "update-video",
    Finished = "finished",
    Error = "error",
    /* ----------------------------------- Mux ---------------------------------- */
    MuxAssetCreated = "mux-asset-created",
    MuxAssetReady = "mux-asset-ready",
    MuxAssetErrored = "mux-asset-errored",
    MuxAssetDeleted = "mux-asset-deleted",
    MuxAssetTrackReady = "mux-asset-track-ready",
}

export enum VideoStatus {
    Started = "Video processing started",
    GetVideo = "Getting video information",
    CleanUp = "Cleaning up previous data",
    GenerateTitle = "Generating video title",
    GenerateDescription = "Generating video description",
    GenerateThumbnail = "Generating video thumbnail",
    GeneratePrompt = "Generating video prompt",
    GetTranscript = "Fetching video transcript",
    UpdateVideo = "Updating video information",
    Finished = "Video processing finished",
    Error = "Error processing video",
    /* ----------------------------------- Mux ---------------------------------- */
    MuxAssetCreated = "Video created",
    MuxAssetReady = "Video ready",
    MuxAssetErrored = "Video errored",
    MuxAssetDeleted = "Video deleted",
    MuxAssetTrackReady = "Video track ready",
}

// Create a mapping between VideoEvents and VideoStatus
export const VideoEventStatusMap: Record<VideoEvents, VideoStatus> = {
    [VideoEvents.Started]: VideoStatus.Started,
    [VideoEvents.GetVideo]: VideoStatus.GetVideo,
    [VideoEvents.CleanUp]: VideoStatus.CleanUp,
    [VideoEvents.GenerateTitle]: VideoStatus.GenerateTitle,
    [VideoEvents.GenerateDescription]: VideoStatus.GenerateDescription,
    [VideoEvents.GenerateThumbnail]: VideoStatus.GenerateThumbnail,
    [VideoEvents.GeneratePrompt]: VideoStatus.GeneratePrompt,
    [VideoEvents.GetTranscript]: VideoStatus.GetTranscript,
    [VideoEvents.UpdateVideo]: VideoStatus.UpdateVideo,
    [VideoEvents.Finished]: VideoStatus.Finished,
    [VideoEvents.Error]: VideoStatus.Error,
    /* ----------------------------------- Mux ---------------------------------- */
    [VideoEvents.MuxAssetCreated]: VideoStatus.MuxAssetCreated,
    [VideoEvents.MuxAssetReady]: VideoStatus.MuxAssetReady,
    [VideoEvents.MuxAssetErrored]: VideoStatus.MuxAssetErrored,
    [VideoEvents.MuxAssetDeleted]: VideoStatus.MuxAssetDeleted,
    [VideoEvents.MuxAssetTrackReady]: VideoStatus.MuxAssetTrackReady,
};

// Create channel names by procedure and videoId
export function buildEventChannelName(videoId: string, procedure: VideoProcedures) {
    return `${videoId}:${procedure}`;
}

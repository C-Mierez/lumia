export enum GeneralEvents {
    Started = "started",
    Finished = "finished",
}

export enum VideoEvents {
    GetVideo = "get-video",
    CleanUp = "clean-up",
    GenerateTile = "generate-title",
    GenerateDescription = "generate-description",
    GenerateThumbnail = "generate-thumbnail",
    GeneratePrompt = "generate-prompt",
    GetTranscript = "get-transcript",
    UpdateVideo = "update-video",
    Finished = "finished",
}

export enum VideoStatus {
    GetVideo = "Getting video information",
    CleanUp = "Cleaning up previous data",
    GenerateTile = "Generating video title",
    GenerateDescription = "Generating video description",
    GenerateThumbnail = "Generating video thumbnail",
    GeneratePrompt = "Generating video prompt",
    GetTranscript = "Fetching video transcript",
    UpdateVideo = "Updating video information",
    Finished = "Finished",
}

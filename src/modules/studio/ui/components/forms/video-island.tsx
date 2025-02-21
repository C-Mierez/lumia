import { formatDistanceToNow } from "date-fns";
import { CaptionsIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";

import { trpc } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import CopyToClipboardButton from "@components/copy-to-clipboard-button";
import { Button } from "@components/ui/button";
import { StatusBadge } from "@components/ui/status-badge";
import { formatUppercaseFirstLetter, getFullVideoUrl } from "@lib/utils";
import { VideoStatus } from "@modules/videos/server/constants";
import VideoPlayer from "@modules/videos/ui/components/video-player";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

import VideoUploader from "../video-uploader";

interface VideoIslandProps {
    video: StudioGetOneOutput;
}

enum ProcessingState {
    Processed = "processed",
    Processing = "processing",
    Unprocessed = "unprocessed",
}

function getProcessingState(video: StudioGetOneOutput): ProcessingState {
    if (!video.muxUploadId) return ProcessingState.Unprocessed;

    if (!!video.muxPlaybackId) return ProcessingState.Processed;

    return ProcessingState.Processing;
}

export default function VideoIsland({ video }: VideoIslandProps) {
    const processingState = getProcessingState(video);

    return (
        <div className="bg-background-alt flex flex-col gap-4 rounded-md p-4">
            {(() => {
                switch (processingState) {
                    case ProcessingState.Processed: {
                        return <ProcessedVideo video={video} />;
                    }
                    case ProcessingState.Processing: {
                        return <ProcessingVideo video={video} />;
                    }
                    case ProcessingState.Unprocessed: {
                        return <UnprocessedVideo video={video} />;
                    }
                }
            })()}

            {processingState !== ProcessingState.Unprocessed && (
                <VideoDetails video={video} processingState={processingState} />
            )}
        </div>
    );
}

function ProcessedVideo({ video }: VideoIslandProps) {
    return <VideoPlayer playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />;
}

function ProcessingVideo({ video }: VideoIslandProps) {
    return (
        <div className="relative aspect-video w-full shrink-0">
            <VideoThumbnail
                imageUrl={video.thumbnailUrl}
                previewUrl={video.previewUrl}
                title={video.title}
                duration={video.duration || 0}
            />
        </div>
    );
}

function UnprocessedVideo({ video }: VideoIslandProps) {
    const utils = trpc.useUtils();

    const onSuccess = async () => {
        await utils.studio.getOne.invalidate({ id: video.id });
    };

    const upload = trpc.videos.requestUpload.useMutation({
        onSuccess,
    });

    const endpointFetch = async () => {
        const { url } = await upload.mutateAsync({
            videoId: video.id,
            currentUploadId: video.muxUploadId,
        });

        return url;
    };

    return <VideoUploader onSuccess={onSuccess} endpoint={endpointFetch} />;
}

function VideoDetails({ video, processingState }: VideoIslandProps & { processingState: ProcessingState }) {
    const utils = trpc.useUtils();
    const fullVideoURL = getFullVideoUrl(video.id);

    const onVideoProcessing = trpc.videos.onVideoProcessing.useSubscription(
        { videoId: video.id },
        {
            async onData(data) {
                if (data.status === VideoStatus.MuxAssetReady || data.status === VideoStatus.MuxAssetTrackReady) {
                    await utils.studio.getOne.invalidate({ id: video.id });
                }
            },
        },
    );

    const status =
        processingState === ProcessingState.Processing
            ? (onVideoProcessing.data?.status ?? "Processing")
            : formatUppercaseFirstLetter(video.muxStatus || "Finishing up");

    const subtitleStatus = formatUppercaseFirstLetter(video.muxTrackStatus || "Preparing");

    return (
        <div className="flex flex-col gap-4">
            {/* Video Status */}
            <div className="flex gap-1">
                <StatusBadge
                    leftIcon={processingState === ProcessingState.Processing ? Loader2Icon : CheckCircleIcon}
                    leftLabel="Status"
                    rightLabel={status}
                    status={processingState === ProcessingState.Processing ? "inProgress" : "success"}
                />
                <StatusBadge
                    leftIcon={processingState === ProcessingState.Processing ? Loader2Icon : CaptionsIcon}
                    leftLabel="Subtitles"
                    rightLabel={subtitleStatus}
                    status={processingState === ProcessingState.Processing ? "inProgress" : "success"}
                />
            </div>
            {/* Video URL */}
            <div>
                <p className="text-muted-foreground text-xs">Video URL</p>
                <div className="flex items-end gap-2">
                    <Button asChild type="button" variant={"link"} className="relative line-clamp-1 w-full px-0">
                        <Link href={fullVideoURL}>
                            {fullVideoURL}
                            <div className="to-background-alt absolute top-0 right-0 bottom-0 z-50 w-6 bg-linear-to-r from-transparent" />
                        </Link>
                    </Button>
                    <CopyToClipboardButton targetContent={fullVideoURL} />
                </div>
            </div>
            <div className="flex justify-between gap-2">
                <div>
                    <p className="text-muted-foreground text-xs">Last Updated</p>
                    <div className="flex items-end gap-2">
                        <div className="line-clamp-1 p-2 px-0 text-sm">
                            {formatDistanceToNow(video.updatedAt, { addSuffix: true })}
                        </div>
                    </div>
                </div>
                <div className="text-end">
                    <p className="text-muted-foreground text-xs">Created</p>
                    <div className="flex items-end gap-2">
                        <div className="line-clamp-1 p-2 px-0 text-sm">
                            {formatDistanceToNow(video.createdAt, { addSuffix: true })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

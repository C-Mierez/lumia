import { WatchGetOneOutput } from "@/trpc/types";
import VideoPlayer from "@modules/videos/ui/components/video-player";

import { VideoAuthor } from "./video-author";
import { VideoInteractions } from "./video-interactions";
import { Separator } from "@components/ui/separator";
import VideoDescription from "./video-description";

interface VideoIslandProps {
    video: NonNullable<WatchGetOneOutput>;
}

export function VideoIsland({ video }: VideoIslandProps) {
    return (
        <div className="bg-background-alt flex flex-col gap-4 overflow-hidden rounded-md">
            <VideoPlayer playbackId={video?.muxPlaybackId} thumbnailUrl={video?.thumbnailUrl} />
            <div className="flex flex-col gap-4 px-4 pb-4">
                {/* Title */}
                <div className="font-brand text-xl">{video?.title}</div>
                {/* CTA */}
                <div className="flex items-center justify-between">
                    {/* Author Data */}
                    <VideoAuthor video={video} showButton />

                    {/* Interactions */}
                    <VideoInteractions video={video} />
                </div>

                <Separator />

                {/* Description */}
                <VideoDescription video={video} />
            </div>
        </div>
    );
}

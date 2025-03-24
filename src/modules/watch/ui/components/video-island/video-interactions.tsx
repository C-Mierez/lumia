import { WatchGetOneOutput } from "@/trpc/types";
import VideoMenu from "@modules/videos/ui/components/video-menu";

import { VideoRating } from "./video-rating";

interface VideoInteractionsProps {
    video: NonNullable<WatchGetOneOutput>;
}

export function VideoInteractions({ video }: VideoInteractionsProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <VideoRating video={video} />
            <VideoMenu videoId={video.id} />
        </div>
    );
}

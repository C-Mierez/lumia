import { WatchGetOneOutput } from "@/trpc/types";
import { Button } from "@components/ui/button";
import { VideoRating } from "./video-rating";
import VideoMenu from "@modules/videos/ui/components/video-menu";

interface VideoInteractionsProps {
    video: NonNullable<WatchGetOneOutput>;
}

export function VideoInteractions({ video }: VideoInteractionsProps) {
    return (
        <div className="flex items-center gap-2">
            <VideoRating />
            <VideoMenu videoId={video.id} onDestructive={() => {}} />
        </div>
    );
}

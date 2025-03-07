"use client";

import { HomeSearchManyOutput } from "@/trpc/types";
import { useIsMobile } from "@hooks/use-mobile";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import { GridVideoCard, GridVideoCardSkeleton } from "@modules/videos/ui/components/video-cards/grid-video-card";
import { ListVideoCard, ListVideoCardSkeleton } from "@modules/videos/ui/components/video-cards/list-video-card";

interface VideoListProps {
    videos: HomeSearchManyOutput["items"];
}

export function VideoList({ videos }: VideoListProps) {
    const isMobile = useIsMobile();

    if (videos.length === 0)
        // return <div className="text-brand text-muted-foreground mx-auto text-sm">No videos found</div>;
        return null;

    return (
        <div className="mx-auto grid w-full max-w-7xl auto-rows-fr grid-cols-1 gap-4">
            {videos.map((video, i) =>
                isMobile ? (
                    <GridVideoCard key={`${i}${video.id}`} video={video} />
                ) : (
                    <ListVideoCard key={`${i}${video.id}`} video={video} />
                ),
            )}
        </div>
    );
}

export function VideoListSkeleton() {
    const isMobile = useIsMobile();
    return (
        <div className="mx-auto grid w-full max-w-7xl auto-rows-fr grid-cols-1 gap-4">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((i) =>
                isMobile ? <GridVideoCardSkeleton key={i} /> : <ListVideoCardSkeleton key={i} />,
            )}
        </div>
    );
}

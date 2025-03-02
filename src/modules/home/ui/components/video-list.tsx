import { HomeSearchManyOutput } from "@/trpc/types";
import { useIsMobile } from "@hooks/use-mobile";
import { GridVideoCard } from "@modules/videos/ui/components/video-cards/grid-video-card";
import { ListVideoCard } from "@modules/videos/ui/components/video-cards/list-video-card";

interface VideoListProps {
    videos: HomeSearchManyOutput["items"];
}

export function VideoList({ videos }: VideoListProps) {
    const isMobile = useIsMobile();

    if (videos.length === 0)
        return <div className="text-brand text-muted-foreground mx-auto text-sm">No videos found</div>;

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

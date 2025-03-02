import { HomeSearchManyOutput } from "@/trpc/types";
import { GridVideoCard } from "@modules/videos/ui/components/video-cards/grid-video-card";

interface VideoGridProps {
    videos: HomeSearchManyOutput["items"];
}

export function VideoGrid({ videos }: VideoGridProps) {
    if (videos.length === 0)
        return <div className="text-brand text-muted-foreground mx-auto text-sm">No videos found</div>;

    return (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video, i) => (
                <GridVideoCard key={`${i}${video.id}`} video={video} />
            ))}
        </div>
    );
}

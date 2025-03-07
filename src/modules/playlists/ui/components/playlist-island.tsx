import { PlaylistsGetOneOutput } from "@/trpc/types";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

import PlaylistMenu from "./playlist-menu";

interface PlaylistIslandProps {
    playlist: PlaylistsGetOneOutput;
}

export default function PlaylistIsland({ playlist }: PlaylistIslandProps) {
    return (
        <div className="bg-background-alt top-20 mx-auto flex h-fit w-full max-w-md flex-col gap-4 rounded-md p-8 xl:sticky">
            <div className="aspect-video w-full">
                <VideoThumbnail
                    duration={0}
                    imageUrl={playlist.thumbnailUrl}
                    previewUrl={playlist.thumbnailUrl}
                    title={playlist.name}
                />
            </div>
            <div className="flex justify-between gap-3">
                <div>
                    <h1 className="font-brand text-xl font-bold">{playlist.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {playlist.description ? playlist.description : "No description"}
                    </p>
                </div>
                <div>
                    <PlaylistMenu playlist={playlist} />
                </div>
            </div>
        </div>
    );
}

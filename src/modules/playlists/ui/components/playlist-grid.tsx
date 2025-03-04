import { PlaylistsGetManyOutput } from "@/trpc/types";

import PlaylistCard from "./playlists-cards/playlist-card";

interface PlaylistsGridProps {
    playlists: PlaylistsGetManyOutput["items"];
}

export default function PlaylistsGrid({ playlists }: PlaylistsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
        </div>
    );
}

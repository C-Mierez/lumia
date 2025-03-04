import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import PlaylistView from "@modules/playlists/ui/views/playlist-view";

export const dynamic = "force-dynamic";

interface PlaylistPageProps {
    params: Promise<{
        playlistId: string;
    }>;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
    const { playlistId } = await params;

    prefetch(trpc.playlists.getOnePlaylist.queryOptions({ playlistId }));

    prefetch(trpc.playlists.getVideos.infiniteQueryOptions({ playlistId, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }));

    return (
        <HydrateClient>
            <PlaylistView playlistId={playlistId} />
        </HydrateClient>
    );
}

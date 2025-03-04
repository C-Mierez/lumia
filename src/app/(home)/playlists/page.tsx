import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import PlaylistsView from "@modules/playlists/ui/views/playlists-view";

export const dynamic = "force-dynamic";

interface PlaylistsPageProps {}

export default async function PlaylistsPage({}: PlaylistsPageProps) {
    void prefetch(
        trpc.playlists.getManyPlaylists.infiniteQueryOptions({
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <PlaylistsView />
        </HydrateClient>
    );
}

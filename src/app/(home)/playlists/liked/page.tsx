import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import LikedView from "@modules/playlists/ui/views/liked-view";

export const dynamic = "force-dynamic";

interface LikedPageProps {}

export default async function LikedPage({}: LikedPageProps) {
    void prefetch(
        trpc.playlists.getManyLiked.infiniteQueryOptions({
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <LikedView />
        </HydrateClient>
    );
}

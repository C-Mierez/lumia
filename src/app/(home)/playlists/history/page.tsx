import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import HistoryView from "@modules/playlists/ui/views/history-view";

export const dynamic = "force-dynamic";

interface HistoryPageProps {}

export default async function HistoryPage({}: HistoryPageProps) {
    void prefetch(
        trpc.playlists.getManyHistory.infiniteQueryOptions({
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <HistoryView />
        </HydrateClient>
    );
}

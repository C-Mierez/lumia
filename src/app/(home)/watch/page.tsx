import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import WatchView from "@modules/watch/ui/views/watch-view";

export const dynamic = "force-dynamic";

interface VideoPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function VideoPage({ searchParams }: VideoPageProps) {
    const { v } = await searchParams;
    if (!v) return null;

    void prefetch(trpc.watch.getOne.queryOptions({ videoId: v }));

    void prefetch(
        trpc.watch.getManyComments.infiniteQueryOptions({ videoId: v, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }),
    );

    return (
        <HydrateClient>
            <WatchView videoId={v} />
        </HydrateClient>
    );
}

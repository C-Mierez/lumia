import { HydrateClient } from "@/trpc/server";
import { SEARCH_PARAMS } from "@lib/searchParams";
import WatchView from "@modules/watch/ui/views/watch-view";

export const dynamic = "force-dynamic";

interface VideoPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function VideoPage({ searchParams }: VideoPageProps) {
    const { v } = await searchParams;

    if (!v) return null;

    return (
        <HydrateClient>
            <WatchView videoId={v} />
        </HydrateClient>
    );
}

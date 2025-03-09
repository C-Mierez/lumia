import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import ChannelPlaylistsSlotView from "@modules/channels/ui/views/channel-playlists-slot-view";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function ChannelPage({ searchParams }: ChannelPageProps) {
    const { u } = await searchParams;

    return (
        <HydrateClient>
            <div className="mx-auto">A cool description about your channel would go here, but I am tired.</div>
        </HydrateClient>
    );
}

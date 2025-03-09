import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import ChannelHomeView from "@modules/channels/ui/views/channel-home-view";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function ChannelPage({ searchParams }: ChannelPageProps) {
    const { u } = await searchParams;

    prefetch(trpc.channels.getManyLatest.infiniteQueryOptions({ userId: u!, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }));

    prefetch(
        trpc.channels.getManyPlaylists.infiniteQueryOptions({ userId: u!, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }),
    );

    return (
        <HydrateClient>
            <ChannelHomeView userId={u!} />
        </HydrateClient>
    );
}

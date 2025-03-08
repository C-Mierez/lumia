import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import ChannelView from "@modules/channels/ui/views/channel-view";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function ChannelPage({ searchParams }: ChannelPageProps) {
    const { u } = await searchParams;

    prefetch(trpc.channels.getOne.queryOptions({ userId: u! }));

    prefetch(
        trpc.subscriptions.getSubscribers.infiniteQueryOptions({ userId: u!, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }),
    );

    return (
        <HydrateClient>
            <ChannelView userId={u!} />
        </HydrateClient>
    );
}

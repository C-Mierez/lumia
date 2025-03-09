import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import ChannelHeaderSlotView from "@modules/channels/ui/views/channel-header-slot-view";

export const dynamic = "force-dynamic";

interface ChannelHeaderSlotProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function ChannelHeaderSlot({ searchParams }: ChannelHeaderSlotProps) {
    const { u } = await searchParams;

    prefetch(trpc.channels.getOne.queryOptions({ userId: u! }));

    prefetch(
        trpc.subscriptions.getSubscribers.infiniteQueryOptions({ userId: u!, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }),
    );

    return (
        <HydrateClient>
            <ChannelHeaderSlotView userId={u!} />
        </HydrateClient>
    );
}

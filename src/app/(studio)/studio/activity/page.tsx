import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import ActivityView from "@modules/studio/ui/views/activity-view";

export const dynamic = "force-dynamic";

export default function StudioPage() {
    prefetch(trpc.studio.getChannelStats.queryOptions());

    prefetch(trpc.studio.getLatestComments.queryOptions());

    prefetch(
        trpc.subscriptions.getSubscribers.infiniteQueryOptions({
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <ActivityView />
        </HydrateClient>
    );
}

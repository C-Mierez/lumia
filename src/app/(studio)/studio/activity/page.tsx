import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import ActivityView from "@modules/studio/ui/views/activity-view";

export const dynamic = "force-dynamic";

export default function StudioPage() {
    prefetch(trpc.studio.getChannelStats.queryOptions());

    return (
        <HydrateClient>
            <ActivityView />
        </HydrateClient>
    );
}

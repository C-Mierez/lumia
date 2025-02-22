import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import StudioView from "@modules/studio/ui/views/studio-view";

export const dynamic = "force-dynamic";

export default function StudioPage() {
    prefetch(trpc.studio.getMany.infiniteQueryOptions({ limit: DEFAULT_INFINITE_PREFETCH_LIMIT }));

    prefetch(trpc.categories.getMany.queryOptions());

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    );
}

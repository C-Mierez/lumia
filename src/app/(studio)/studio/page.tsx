import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import StudioView from "@modules/studio/ui/views/studio-view";

export const dynamic = "force-dynamic";

export default function StudioPage() {
    void trpc.studio.getMany.prefetchInfinite({
        limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
    });

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    );
}

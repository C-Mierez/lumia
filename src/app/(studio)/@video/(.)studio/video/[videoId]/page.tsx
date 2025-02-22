import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import VideoModalView from "@modules/studio/ui/views/video-modal-view";

export const dynamic = "force-dynamic";

interface VideoModalPageProps {
    params: Promise<{
        videoId: string;
    }>;
}

export default async function VideoModalPage({ params }: VideoModalPageProps) {
    const { videoId } = await params;

    prefetch(trpc.studio.getOne.infiniteQueryOptions({ id: videoId }));

    prefetch(trpc.categories.getMany.queryOptions());

    return (
        <HydrateClient>
            <VideoModalView videoId={videoId} />
        </HydrateClient>
    );
}

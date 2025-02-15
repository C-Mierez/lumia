import { HydrateClient, trpc } from "@/trpc/server";
import VideoModalView from "@modules/studio/ui/views/video-modal-view";

export const dynamic = "force-dynamic";

interface VideoModalPageProps {
    params: Promise<{
        videoId: string;
    }>;
}

export default async function VideoModalPage({ params }: VideoModalPageProps) {
    const { videoId } = await params;

    void trpc.studio.getOne.prefetchInfinite({
        id: videoId,
    });

    void trpc.categories.getMany.prefetch();

    return (
        <HydrateClient>
            <VideoModalView videoId={videoId} />
        </HydrateClient>
    );
}

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import VideoView from "@modules/studio/ui/views/video-view";

export const dynamic = "force-dynamic";

interface VideoPageProps {
    params: Promise<{
        videoId: string;
    }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
    const { videoId } = await params;

    prefetch(trpc.studio.getOne.queryOptions({ id: videoId }));

    prefetch(trpc.categories.getMany.queryOptions());
    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
}

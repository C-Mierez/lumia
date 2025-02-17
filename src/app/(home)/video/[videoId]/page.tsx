import { HydrateClient, trpc } from "@/trpc/server";
import VideoView from "@modules/home/ui/views/video-view";

export const dynamic = "force-dynamic";

interface VideoPageProps {
    params: Promise<{
        videoId: string;
    }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
    const { videoId } = await params;

    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
}

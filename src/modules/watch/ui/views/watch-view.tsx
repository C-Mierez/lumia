import CommentsSection from "../sections/comments-section";
import VideoSection from "../sections/video-section";

interface WatchViewProps {
    videoId: string;
}

export default function WatchView({ videoId }: WatchViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="flex flex-col gap-4 p-2 md:col-span-3">
                    <VideoSection videoId={videoId} />
                    <CommentsSection videoId={videoId} />
                </div>
                <div className="p-2">
                    <div>Suggestions</div>
                </div>
            </div>
        </div>
    );
}

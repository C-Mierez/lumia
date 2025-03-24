import CommentsSection from "../sections/comments-section";
import SuggestionsSection from "../sections/suggestions-section";
import VideoSection from "../sections/video-section";

interface WatchViewProps {
    videoId: string;
}

export default function WatchView({ videoId }: WatchViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 py-2 md:px-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <div className="flex flex-col gap-4 md:p-2 xl:col-span-3">
                    <VideoSection videoId={videoId} />
                    <CommentsSection videoId={videoId} />
                </div>
                <div className="m-2 ml-0">
                    <SuggestionsSection videoId={videoId} />
                </div>
            </div>
        </div>
    );
}

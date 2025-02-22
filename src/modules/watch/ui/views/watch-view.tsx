import WatchSection from "../sections/watch-section";

interface WatchViewProps {
    videoId: string;
}

export default function WatchView({ videoId }: WatchViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <WatchSection videoId={videoId} />
        </div>
    );
}

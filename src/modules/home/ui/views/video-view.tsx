import Test from "@modules/studio/ui/sections/test";

interface VideoViewProps {
    videoId?: string;
}

export default function VideoView({ videoId }: VideoViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <Test />
        </div>
    );
}

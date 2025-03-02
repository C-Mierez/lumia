import LikedSection from "../sections/liked-section";

interface LikedViewProps {}

export default function LikedView({}: LikedViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <LikedSection />
        </div>
    );
}

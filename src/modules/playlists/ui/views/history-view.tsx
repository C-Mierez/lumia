import HistorySection from "../sections/history-section";

interface HistoryViewProps {}

export default function HistoryView({}: HistoryViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <HistorySection />
        </div>
    );
}

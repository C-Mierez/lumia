import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

interface WatchSectionProps {
    videoId: string;
}

export default function WatchSection({ videoId }: WatchSectionProps) {
    return (
        <Suspense fallback={<div>Loading</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <WatchSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function WatchSectionSuspense({ videoId }: WatchSectionProps) {
    return <div>Hi</div>;
}

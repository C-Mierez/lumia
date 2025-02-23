"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VideoIsland } from "../components/video-island/video-island";

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
    const trpc = useTRPC();
    const { data: video } = useSuspenseQuery(
        trpc.watch.getOne.queryOptions({
            videoId: videoId,
        }),
    );

    if (video === null) return <div>Video not found</div>;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-4 p-2 md:col-span-3">
                <VideoIsland video={video} />

                <div>Comments</div>
            </div>
            <div className="p-2">
                <div>Suggestions</div>
            </div>
        </div>
    );
}

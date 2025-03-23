"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { VideoList, VideoListSkeleton } from "@modules/home/ui/components/video-list";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

interface HistorySectionProps {}

export default function HistorySection({}: HistorySectionProps) {
    return (
        <div className="px-0 pt-2 md:px-2">
            <div className="mb-6">
                <h1 className="font-brand text-2xl font-bold">Watch History</h1>
                <p className="text-muted-foreground text-sm">Go back through videos you have previously watched</p>
            </div>
            <Suspense fallback={<VideoListSkeleton />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <HistorySectionSuspense />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}

function HistorySectionSuspense({}: HistorySectionProps) {
    const trpc = useTRPC();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        trpc.playlists.getManyHistory.infiniteQueryOptions(
            {
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const videos = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <>
            <VideoList videos={videos} />
            <InfiniteScroll
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
}

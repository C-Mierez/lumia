"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import ChannelHeader, { ChannelHeaderSkeleton } from "../components/channel-header";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { GridVideoCard, GridVideoCardSkeleton } from "@modules/videos/ui/components/video-cards/grid-video-card";
import InfiniteScroll from "@components/infinite-scroll";
import { range } from "@lib/utils";

interface ChannelVideoSlotSectionProps {
    userId: string;
}

export default function ChannelVideoSlotSection({ userId }: ChannelVideoSlotSectionProps) {
    return (
        <>
            <Suspense fallback={<ChannelVideoSlotSkeleton />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelVideoSlotSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelVideoSlotSectionSuspense({ userId }: ChannelVideoSlotSectionProps) {
    const trpc = useTRPC();

    const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
        trpc.channels.getManyLatest.infiniteQueryOptions(
            { userId, limit: DEFAULT_INFINITE_PREFETCH_LIMIT },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const videos = data?.pages.flatMap((page) => page.videos).slice(0, DEFAULT_INFINITE_PREFETCH_LIMIT);

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos?.map((video) => (
                    <div key={video.id}>
                        <GridVideoCard video={video} />
                    </div>
                ))}
            </div>
            <InfiniteScroll
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
            />
        </>
    );
}

function ChannelVideoSlotSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((i) => (
                <div key={i}>
                    <GridVideoCardSkeleton />
                </div>
            ))}
        </div>
    );
}

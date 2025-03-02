"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { Skeleton } from "@components/ui/skeleton";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { VideoGrid } from "../components/video-grid";

interface SubscriptionsSectionProps {
    searchCategoryId?: string;
}

export default function SubscriptionsSection({ searchCategoryId }: SubscriptionsSectionProps) {
    return (
        // We add a key to Suspense to force a re-render when the searchQuery or searchCategoryId changes
        <Suspense key={searchCategoryId} fallback={<HomeFallback />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <SubscriptionsSectionSuspense searchCategoryId={searchCategoryId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function SubscriptionsSectionSuspense({ searchCategoryId }: SubscriptionsSectionProps) {
    const trpc = useTRPC();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        trpc.home.searchManySubscriptions.infiniteQueryOptions(
            {
                searchCategory: searchCategoryId,
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
            <VideoGrid videos={videos} />
            <InfiniteScroll
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
}

function HomeFallback() {
    return (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="aspect-video size-full" />
                    <div className="flex items-start justify-between gap-3">
                        <Skeleton className="size-8 rounded-full lg:size-9" />

                        <div className="z-20 flex flex-1 flex-col gap-1">
                            <Skeleton className="text-muted-foreground line-clamp-1 text-sm">&nbsp;</Skeleton>
                            <Skeleton className="text-muted-foreground line-clamp-1 w-1/3 text-sm">&nbsp;</Skeleton>
                            <Skeleton className="text-muted-foreground line-clamp-1 w-2/3 text-sm">&nbsp;</Skeleton>
                        </div>
                        <div className="z-50 aspect-square p-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

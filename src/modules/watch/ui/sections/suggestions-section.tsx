"use client";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import SuggestionsIsland from "../components/suggestions-island/suggestions-island";

interface SuggestionsSectionProps {
    videoId: string;
}

export default function SuggestionsSection({ videoId }: SuggestionsSectionProps) {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <SuggestionsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function SuggestionsSectionSuspense({ videoId }: SuggestionsSectionProps) {
    const trpc = useTRPC();
    const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
        trpc.suggestions.getMany.infiniteQueryOptions(
            {
                videoId: videoId,
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const suggestions = data.pages.flatMap((page) => page.items);

    return (
        <>
            <SuggestionsIsland videoId={videoId} suggestions={suggestions} />
            {suggestions.length > 0 && (
                <InfiniteScroll
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    label="No more videos found"
                />
            )}
        </>
    );
}

"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@components/ui/skeleton";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import { CommentsIsland } from "../components/comments-island/comments-island";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";

interface CommentsSectionProps {
    videoId: string;
}

export default function CommentsSection({ videoId }: CommentsSectionProps) {
    return (
        <Suspense fallback={<CommentsSectionFallback />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <CommentsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function CommentsSectionSuspense({ videoId }: CommentsSectionProps) {
    const trpc = useTRPC();
    const commentsQuery = useSuspenseInfiniteQuery(
        trpc.watch.getManyComments.infiniteQueryOptions(
            {
                videoId: videoId,
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const comments = commentsQuery.data.pages.flatMap((page) => page.comments);

    return <CommentsIsland videoId={videoId} comments={comments} query={commentsQuery as any} />;
}

function CommentsSectionFallback() {
    return (
        <>
            <Skeleton className="aspect-video rounded-lg" />

            <div className="flex flex-col gap-4 px-4 pb-4">
                {/* Title */}
                <Skeleton className="h-8 w-1/2" />
                {/* CTA */}
                <div className="flex items-center justify-between">
                    {/* Author Data */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex flex-col justify-center gap-2">
                            <Skeleton className="h-4 w-30" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>

                    {/* Interactions */}
                    <Skeleton className="h-8 w-1/4" />
                </div>
            </div>
        </>
    );
}

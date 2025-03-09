"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import ChannelHeader from "../components/channel-header";
import { ListVideoCard } from "@modules/videos/ui/components/video-cards/list-video-card";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";

interface FeaturedSectionProps {
    userId: string;
}

export default function FeaturedSection({ userId }: FeaturedSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-brand text-xl">Featured</h1>

            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <FeaturedSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}

function FeaturedSectionSuspense({ userId }: FeaturedSectionProps) {
    const trpc = useTRPC();

    const { data } = useSuspenseInfiniteQuery(
        trpc.channels.getManyLatest.infiniteQueryOptions(
            { userId, limit: DEFAULT_INFINITE_PREFETCH_LIMIT },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const video = data?.pages[0]?.videos[0];

    return (
        <>
            {video ? (
                <ListVideoCard video={video} />
            ) : (
                <p className="text-muted-foreground text-sm">No videos have been uploaded yet</p>
            )}
        </>
    );
}

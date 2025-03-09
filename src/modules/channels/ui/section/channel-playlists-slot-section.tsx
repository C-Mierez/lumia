"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import PlaylistCard from "@modules/playlists/ui/components/playlists-cards/playlist-card";
import { GridVideoCardSkeleton } from "@modules/videos/ui/components/video-cards/grid-video-card";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

interface ChannelPlaylistsSlotSectionProps {
    userId: string;
}

export default function ChannelPlaylistsSlotSection({ userId }: ChannelPlaylistsSlotSectionProps) {
    return (
        <>
            <Suspense fallback={<ChannelPlaylistSlotSkeleton />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelPlaylistsSlotSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelPlaylistsSlotSectionSuspense({ userId }: ChannelPlaylistsSlotSectionProps) {
    const trpc = useTRPC();

    const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
        trpc.channels.getManyPlaylists.infiniteQueryOptions(
            { userId, limit: DEFAULT_INFINITE_PREFETCH_LIMIT },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const playlists = data?.pages.flatMap((page) => page.items).slice(0, DEFAULT_INFINITE_PREFETCH_LIMIT);

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {playlists?.map((playlist) => (
                    <div key={playlist.id}>
                        <PlaylistCard playlist={playlist} />
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

function ChannelPlaylistSlotSkeleton() {
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

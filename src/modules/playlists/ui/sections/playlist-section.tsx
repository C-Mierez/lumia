"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { VideoList } from "@modules/home/ui/components/video-list";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import PlaylistIsland from "../components/playlist-island";

interface PlaylistSectionProps {
    playlistId: string;
}

export default function PlaylistSection({ playlistId }: PlaylistSectionProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <PlaylistSectionSuspense playlistId={playlistId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function PlaylistSectionSuspense({ playlistId }: PlaylistSectionProps) {
    const trpc = useTRPC();

    const { data: playlist } = useSuspenseQuery(trpc.playlists.getOnePlaylist.queryOptions({ playlistId }));

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        trpc.playlists.getVideos.infiniteQueryOptions(
            {
                playlistId,
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
            <div className="relative flex flex-col gap-8 p-4 xl:flex-row xl:gap-4">
                <PlaylistIsland playlist={playlist} />
                <div>
                    <VideoList videos={videos} />
                    <InfiniteScroll
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                    />
                </div>
            </div>
        </>
    );
}

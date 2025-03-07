"use client";

import { Suspense, useState } from "react";

import { PlusIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import CreatePlaylistModal from "../components/create-playlist-modal";
import PlaylistsGrid from "../components/playlist-grid";

interface PlaylistsSectionProps {}

export default function PlaylistsSection({}: PlaylistsSectionProps) {
    const [isNewPlaylist, setIsNewPlaylist] = useState(false);

    const onClickNew = () => {
        setIsNewPlaylist(true);
    };

    const onCloseNew = () => {
        setIsNewPlaylist(false);
    };

    return (
        <div className="px-2 pt-2">
            <CreatePlaylistModal isOpen={isNewPlaylist} onClose={onCloseNew} onConfirm={() => {}} />
            <div className="mb-12 flex items-end justify-between">
                <div>
                    <h1 className="font-brand text-2xl font-bold">Your Playlists</h1>
                    <p className="text-muted-foreground text-sm">See the playlists you have created</p>
                </div>
                <Button variant={"secondary"} disabled={isNewPlaylist} onClick={onClickNew}>
                    <PlusIcon className="-ml-1" />
                    New
                </Button>
            </div>
            <Suspense fallback={<PlaylistsFallback />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <PlaylistsSectionSuspense />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}

function PlaylistsSectionSuspense({}: PlaylistsSectionProps) {
    const trpc = useTRPC();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        trpc.playlists.getManyPlaylists.infiniteQueryOptions(
            {
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );
    const playlists = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <>
            <PlaylistsGrid playlists={playlists} />

            <InfiniteScroll
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
}

function PlaylistsFallback() {
    return (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="aspect-video size-full" />
                    <div className="flex items-start justify-between gap-3">
                        <div className="z-20 flex flex-1 flex-col gap-1">
                            <Skeleton className="text-muted-foreground line-clamp-1 w-1/4 text-sm">&nbsp;</Skeleton>
                            <Skeleton className="text-muted-foreground line-clamp-1 w-1/2 text-xs">&nbsp;</Skeleton>
                        </div>
                        <div className="z-50 aspect-square p-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

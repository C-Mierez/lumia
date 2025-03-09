"use client";

import { Suspense, useState } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import ChannelHeader from "../components/channel-header";
import { ListVideoCard } from "@modules/videos/ui/components/video-cards/list-video-card";
import { GridVideoCard } from "@modules/videos/ui/components/video-cards/grid-video-card";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@components/ui/carousel";
import Link from "next/link";
import { buildSearchQuery } from "@lib/searchParams";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import PlaylistCard from "@modules/playlists/ui/components/playlists-cards/playlist-card";

interface PlaylistPreviewSectionProps {
    userId: string;
}

export default function PlaylistPreviewSection({ userId }: PlaylistPreviewSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-brand text-xl">Created Playlists</h1>

            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <PlaylistPreviewSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}

function PlaylistPreviewSectionSuspense({ userId }: PlaylistPreviewSectionProps) {
    const trpc = useTRPC();

    const { data } = useSuspenseInfiniteQuery(
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
            {playlists && playlists.length > 0 ? (
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                    }}
                    className="w-full"
                >
                    {/* Scroll Buttons */}
                    <CarouselPrevious className="bg-background left-4 z-20 size-8" />
                    <CarouselNext className="bg-background right-4 z-20 size-8" />

                    <CarouselContent className="-ml-3">
                        {playlists.map((playlist) => (
                            <CarouselItem key={playlist.id} className="md:max-w-1/2 xl:max-w-1/3">
                                <PlaylistCard playlist={playlist} />
                            </CarouselItem>
                        ))}
                        <CarouselItem className="md:max-w-1/4 xl:max-w-1/6">
                            <Link
                                href={`/channel/playlists${buildSearchQuery({ u: userId })}`}
                                className="bg-background-alt grid h-full place-items-center rounded-md"
                            >
                                See all
                            </Link>
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>
            ) : (
                <p className="text-muted-foreground text-sm">No playlists have been created yet</p>
            )}
        </>
    );
}

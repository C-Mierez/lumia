"use client";

import { Suspense, useMemo } from "react";

import { format } from "date-fns";
import { GlobeIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { Skeleton } from "@components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { formatUppercaseFirstLetter, range } from "@lib/utils";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export default function VideosSection() {
    return (
        <>
            {/* Section Title */}
            <div>
                <h1 className="font-brand text-2xl font-bold">Channel Content</h1>
                <p className="text-muted-foreground text-sm">Manage your channel&apos;s content and videos</p>
            </div>

            {/* Section Content */}
            <Suspense fallback={<VideoSectionSkeleton />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <VideosSectionSuspense />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function VideosSectionSuspense() {
    const trpc = useTRPC();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        trpc.studio.getMany.infiniteQueryOptions(
            {
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const videos = data.pages.flatMap((page) => page.items);

    return (
        <div>
            <Table className="mt-4 border-y">
                {/* Header */}
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-full px-6 text-start">Video</TableHead>
                        <TableHead className="px-6 text-center">Visibility</TableHead>
                        <TableHead className="min-w-24 px-6 text-center">Status</TableHead>
                        <TableHead className="min-w-32 px-6 text-center">Date</TableHead>
                        <TableHead className="px-6 text-center">Views</TableHead>
                        <TableHead className="px-6 text-center">Comments</TableHead>
                        <TableHead className="px-6 text-center">Likes</TableHead>
                    </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                    {videos.map((video) => (
                        <Link key={video.id} href={`/studio/video/${video.id}`} legacyBehavior>
                            <TableRow className="cursor-pointer [&_td]:text-center">
                                <TableCell className="min-w-80 py-4 md:min-w-120">
                                    <div className="flex items-stretch gap-4">
                                        <div className="relative aspect-video w-full max-w-26 shrink-0">
                                            <VideoThumbnail
                                                imageUrl={video.thumbnailUrl}
                                                previewUrl={video.previewUrl}
                                                title={video.title}
                                                duration={video.duration || 0}
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col items-start justify-start">
                                            <p className="font-brand text-start">{video.title}</p>
                                            <p className="text-muted-foreground line-clamp-2 text-start text-xs">
                                                {video.description ?? "No video description"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        {video.visibility === "private" ? (
                                            <LockIcon className="size-4" />
                                        ) : (
                                            <GlobeIcon className="size-4" />
                                        )}
                                        <span className="text-muted-foreground text-xs">
                                            {formatUppercaseFirstLetter(video.visibility)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div>{formatUppercaseFirstLetter(video.muxStatus || "Preparing")}</div>
                                </TableCell>
                                <TableCell className="truncate px-6 py-4 text-xs">
                                    <div>{format(new Date(video.createdAt), "d MMM yyyy")}</div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-xs">
                                    <IntlNumber value={video.viewsCount} />
                                </TableCell>
                                <TableCell className="px-6 py-4 text-xs">
                                    <IntlNumber value={video.commentsCount} />
                                </TableCell>
                                <TableCell className="px-6 py-4 text-xs">
                                    <IntlNumber value={video.likesCount} />
                                </TableCell>
                            </TableRow>
                        </Link>
                    ))}
                </TableBody>
            </Table>

            {/* Automatic fetch for infinite scrolling */}
            <InfiniteScroll
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </div>
    );
}

function IntlNumber({ value }: { value: number }) {
    const intlValue = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(value);
    }, [value]);

    return <>{intlValue}</>;
}

function VideoSectionSkeleton() {
    return (
        <Table className="mt-4 border-y">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-full px-6 text-start">Video</TableHead>
                    <TableHead className="px-6 text-center">Visibility</TableHead>
                    <TableHead className="min-w-24 px-6 text-center">Status</TableHead>
                    <TableHead className="min-w-32 px-6 text-center">Date</TableHead>
                    <TableHead className="px-6 text-center">Views</TableHead>
                    <TableHead className="px-6 text-center">Comments</TableHead>
                    <TableHead className="px-6 text-center">Likes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((_, i) => {
                    return (
                        <TableRow key={i}>
                            <TableCell className="flex min-w-80 items-stretch gap-4 py-4 md:min-w-120">
                                <Skeleton className="aspect-video w-full max-w-26 shrink-0" />
                                <div className="flex flex-1 flex-col items-start justify-start gap-2">
                                    <Skeleton className="font-brand w-1/4">&nbsp;</Skeleton>
                                    <Skeleton className="text-muted-foreground w-3/4 text-xs">&nbsp;</Skeleton>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

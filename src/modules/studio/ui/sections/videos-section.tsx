"use client";

import { Suspense } from "react";

import { format } from "date-fns";
import { GlobeIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { Skeleton } from "@components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { formatUppercaseFirstLetter, range } from "@lib/utils";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

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
    const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const videos = data.pages.flatMap((page) => page.items);

    const onOpenChange = (isOpen: boolean) => {};

    return (
        <div>
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
                    {data.pages.flatMap((page) =>
                        page.items.map((video) => {
                            return (
                                <Link href={`/studio/video/${video.id}`} key={video.id} legacyBehavior>
                                    <TableRow className="cursor-pointer [&_td]:text-center">
                                        <TableCell className="px-6 py-4">
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
                                                    <p className="font-brand">{video.title}</p>
                                                    <p className="text-muted-foreground text-xs">
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
                                                    {/* // Capitalize visibility */}
                                                    {video.visibility.charAt(0).toUpperCase() +
                                                        video.visibility.slice(1)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div>{formatUppercaseFirstLetter(video.muxStatus || "Preparing")}</div>
                                        </TableCell>
                                        <TableCell className="truncate px-6 py-4 text-xs">
                                            <div>{format(new Date(video.createdAt), "d MMM yyyy")}</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-xs">views</TableCell>
                                        <TableCell className="px-6 py-4 text-xs">comments</TableCell>
                                        <TableCell className="px-6 py-4 text-xs">likes</TableCell>
                                    </TableRow>
                                </Link>
                            );
                        }),
                    )}
                </TableBody>
            </Table>

            {/* Automatic fetch for infinite scrolling */}
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    );
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
                            <TableCell className="flex items-stretch gap-4 px-6 py-4">
                                <Skeleton className="aspect-video w-full max-w-26 shrink-0" />
                                <div className="flex flex-1 flex-col items-start justify-start gap-2">
                                    <Skeleton className="font-brand w-full max-w-18">&nbsp;</Skeleton>
                                    <Skeleton className="text-muted-foreground w-full max-w-26 text-xs">
                                        &nbsp;
                                    </Skeleton>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

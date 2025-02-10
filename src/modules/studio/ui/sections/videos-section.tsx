"use client";

import { Suspense } from "react";

import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";

export default function VideosSection() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <VideosSectionSuspense />
            </ErrorBoundary>
        </Suspense>
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

    return (
        <div>
            <Table className="border-y">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-full px-6">Video</TableHead>
                        <TableHead className="px-6">Visibility</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="px-6">Date</TableHead>
                        <TableHead className="px-6">Views</TableHead>
                        <TableHead className="px-6">Comments</TableHead>
                        <TableHead className="px-6">Likes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.pages.flatMap((page) =>
                        page.items.map((video) => {
                            return (
                                <Link href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
                                    <TableRow className="cursor-pointer">
                                        <TableCell className="px-6 py-4">{video.title}</TableCell>
                                        <TableCell className="px-6 py-4">visibility</TableCell>
                                        <TableCell className="px-6 py-4">status</TableCell>
                                        <TableCell className="px-6 py-4">date</TableCell>
                                        <TableCell className="px-6 py-4">views</TableCell>
                                        <TableCell className="px-6 py-4">comments</TableCell>
                                        <TableCell className="px-6 py-4">likes</TableCell>
                                    </TableRow>
                                </Link>
                            );
                        }),
                    )}
                </TableBody>
            </Table>

            {JSON.stringify(data)}

            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    );
}

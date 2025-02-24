"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { Separator } from "@components/ui/separator";
import { Skeleton } from "@components/ui/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VideoIsland } from "../components/video-island/video-island";

interface VideoSectionProps {
    videoId: string;
}

export default function VideoSection({ videoId }: VideoSectionProps) {
    return (
        <Suspense fallback={<VideoSectionFallback />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <VideoSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function VideoSectionSuspense({ videoId }: VideoSectionProps) {
    const trpc = useTRPC();
    const { data: video } = useSuspenseQuery(
        trpc.watch.getOne.queryOptions({
            videoId: videoId,
        }),
    );

    if (video === null) return <div>Video not found</div>;

    return <VideoIsland video={video} />;
}

function VideoSectionFallback() {
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

                <Separator />

                {/* Description */}
                <Skeleton className="h-24 w-full" />
            </div>
        </>
    );
}
// function VideoSectionFallback() {
//     return (
//         <div className="grid max-h-screen grid-cols-1 gap-4 overflow-hidden md:grid-cols-4">
//             <div className="flex flex-col gap-4 p-2 md:col-span-3">
//                 <Skeleton className="aspect-video rounded-lg" />

//                 <div className="flex flex-col gap-4 px-4 pb-4">
//                     {/* Title */}
//                     <Skeleton className="h-8 w-1/2" />
//                     {/* CTA */}
//                     <div className="flex items-center justify-between">
//                         {/* Author Data */}
//                         <div className="flex items-center gap-3">
//                             <Skeleton className="size-10 rounded-full" />
//                             <div className="flex flex-col justify-center gap-2">
//                                 <Skeleton className="h-4 w-30" />
//                                 <Skeleton className="h-4 w-20" />
//                             </div>
//                         </div>

//                         {/* Interactions */}
//                         <Skeleton className="h-8 w-1/4" />
//                     </div>

//                     <Separator />

//                     {/* Description */}
//                     <Skeleton className="h-24 w-full" />
//                 </div>
//             </div>
//             <div className="p-2">
//                 <Skeleton className="h-96 rounded-lg" />
//             </div>
//         </div>
//     );
// }

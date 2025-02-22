"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import VideoUpdateForm from "../components/forms/video-update-form";

interface VideoEditSectionProps {
    videoId: string;
    onOpenChange: (isOpen: boolean) => void;
}

export default function VideoEditSection({ onOpenChange, videoId }: VideoEditSectionProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <VideoEditSectionSuspense videoId={videoId} onOpenChange={onOpenChange} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function VideoEditSectionSuspense({ videoId, onOpenChange }: VideoEditSectionProps) {
    const trpc = useTRPC();
    const videoQuery = useSuspenseQuery(trpc.studio.getOne.queryOptions({ id: videoId }));

    return (
        <>
            <VideoUpdateForm video={videoQuery.data} onOpenChange={onOpenChange} videoQuery={videoQuery} />
        </>
    );
}

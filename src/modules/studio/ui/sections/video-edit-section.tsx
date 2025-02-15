"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";

import VideoEditForm from "../components/video-edit-form";

interface VideoEditSectionProps {
    videoId: string;
    onOpenChange: (isOpen: boolean) => void;
}

export default function VideoEditSection({ onOpenChange, videoId }: VideoEditSectionProps) {
    return (
        <>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <VideoEditSectionSuspense videoId={videoId} onOpenChange={onOpenChange} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function VideoEditSectionSuspense({ videoId, onOpenChange }: VideoEditSectionProps) {
    const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });

    return <VideoEditForm video={video} onOpenChange={onOpenChange}></VideoEditForm>;
}

"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";

import VideoFormModal from "../components/video-form-modal";

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

    return <VideoFormModal video={video} onOpenChange={onOpenChange}></VideoFormModal>;
}

"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { ModalProps } from "@hooks/use-modal";
import { useSuspenseQuery } from "@tanstack/react-query";

import VideoUpdateForm from "../components/forms/video-update-form";

interface VideoEditSectionProps extends ModalProps {
    videoId: string;
}

export default function VideoEditSection(props: VideoEditSectionProps) {
    return (
        <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <VideoEditSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
}

function VideoEditSectionSuspense({ videoId, closeModal }: VideoEditSectionProps) {
    const trpc = useTRPC();
    const videoQuery = useSuspenseQuery(trpc.studio.getOne.queryOptions({ id: videoId }));

    return <VideoUpdateForm video={videoQuery.data} videoQuery={videoQuery} closeModal={closeModal} />;
}

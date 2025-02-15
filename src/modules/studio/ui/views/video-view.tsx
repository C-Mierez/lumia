"use client";

import { useRouter } from "next/navigation";

import VideoEditSection from "../sections/video-edit-section";

interface VideoViewProps {
    videoId: string;
}

export default function VideoView({ videoId }: VideoViewProps) {
    const router = useRouter();

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            router.back();
        }
    };

    return (
        <>
            <VideoEditSection videoId={videoId} onOpenChange={onOpenChange} />
        </>
    );
}

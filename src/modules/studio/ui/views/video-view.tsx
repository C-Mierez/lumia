"use client";

import { usePathname, useRouter } from "next/navigation";

import useModal from "@hooks/use-modal";

import VideoEditSection from "../sections/video-edit-section";

interface VideoViewProps {
    videoId: string;
}

export default function VideoView({ videoId }: VideoViewProps) {
    const router = useRouter();
    const pathname = usePathname();

    const modal = useModal({
        onClose() {
            if (pathname.startsWith("/studio/video/")) router.back();
        },
    });

    return (
        <>
            <VideoEditSection videoId={videoId} {...modal} />
        </>
    );
}

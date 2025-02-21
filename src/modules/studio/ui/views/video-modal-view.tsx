"use client";

import { usePathname, useRouter } from "next/navigation";

import SlotModal from "@components/slot-modal";

import VideoEditSection from "../sections/video-edit-section";

interface VideoModalViewProps {
    videoId: string;
}

export default function VideoModalView({ videoId }: VideoModalViewProps) {
    const router = useRouter();
    const pathname = usePathname();

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            if (pathname.startsWith("/studio/video/")) router.back();
        }
    };

    return (
        <>
            <SlotModal onOpenChange={onOpenChange}>
                <VideoEditSection videoId={videoId} onOpenChange={onOpenChange} />
            </SlotModal>
        </>
    );
}

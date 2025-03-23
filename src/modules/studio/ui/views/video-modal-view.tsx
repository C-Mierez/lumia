"use client";

import { usePathname, useRouter } from "next/navigation";

import SlotModal from "@components/slot-modal";
import useModal from "@hooks/use-modal";

import VideoEditSection from "../sections/video-edit-section";

interface VideoModalViewProps {
    videoId: string;
}

export default function VideoModalView({ videoId }: VideoModalViewProps) {
    const router = useRouter();
    const pathname = usePathname();

    const modal = useModal({
        isOpen: true,
        onClose() {
            if (pathname.startsWith("/studio/video/")) router.back();
        },
    });

    return (
        <>
            <SlotModal {...modal}>
                <VideoEditSection videoId={videoId} {...modal} />
            </SlotModal>
        </>
    );
}

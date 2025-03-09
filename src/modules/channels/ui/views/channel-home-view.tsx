"use client";

import { Separator } from "@components/ui/separator";
import FeaturedSection from "../section/featured-section";
import VideoPreviewSection from "../section/video-preview-section";
import PlaylistPreviewSection from "../section/playlist-preview-section";

interface ChannelHomeViewProps {
    userId: string;
}

export default function ChannelHomeView({ userId }: ChannelHomeViewProps) {
    return (
        <>
            <FeaturedSection userId={userId} />
            <Separator />
            <VideoPreviewSection userId={userId} />
            <Separator />
            <PlaylistPreviewSection userId={userId} />
        </>
    );
}

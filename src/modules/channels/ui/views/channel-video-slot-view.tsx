"use client";

import ChannelVideoSlotSection from "../section/channel-video-slot-section";

interface ChannelViewSlotViewProps {
    userId: string;
}

export default function ChannelViewSlotView({ userId }: ChannelViewSlotViewProps) {
    return (
        <>
            <ChannelVideoSlotSection userId={userId} />
        </>
    );
}

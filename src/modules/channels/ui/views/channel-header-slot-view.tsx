"use client";

import ChannelHeaderSlotSection from "../section/channel-header-slot-section";

interface ChannelHeaderSlotViewProps {
    userId: string;
}

export default function ChannelHeaderSlotView({ userId }: ChannelHeaderSlotViewProps) {
    return (
        <>
            <ChannelHeaderSlotSection userId={userId} />
        </>
    );
}

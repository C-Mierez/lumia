"use client";

import ChannelSection from "../section/channel-section";

interface ChannelViewProps {
    userId: string;
}

export default function ChannelView({ userId }: ChannelViewProps) {
    return (
        <>
            <ChannelSection userId={userId} />
        </>
    );
}

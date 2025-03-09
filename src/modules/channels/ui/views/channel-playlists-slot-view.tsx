"use client";

import ChannelPlaylistsSlotSection from "../section/channel-playlists-slot-section";

interface ChannelPlaylistsSlotViewProps {
    userId: string;
}

export default function ChannelPlaylistsSlotView({ userId }: ChannelPlaylistsSlotViewProps) {
    return (
        <>
            <ChannelPlaylistsSlotSection userId={userId} />
        </>
    );
}

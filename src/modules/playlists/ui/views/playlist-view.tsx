"use client";

import PlaylistSection from "../sections/playlist-section";

interface PlaylistViewProps {
    playlistId: string;
}

export default function PlaylistView({ playlistId }: PlaylistViewProps) {
    return (
        <>
            <PlaylistSection playlistId={playlistId} />
        </>
    );
}

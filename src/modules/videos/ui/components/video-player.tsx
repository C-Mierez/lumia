import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    playbackId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}

export default function VideoPlayer({ playbackId, thumbnailUrl, autoPlay, onPlay }: VideoPlayerProps) {
    if (!playbackId) return null;

    return (
        <MuxPlayer
            playbackId={playbackId}
            poster={thumbnailUrl || undefined}
            playerInitTime={0}
            autoPlay={autoPlay}
            thumbnailTime={0}
            className="size-full object-contain"
            accentColor="var(--color-accent)"
            primaryColor="var(--color-foreground)"
            onPlay={onPlay}
        />
    );
}

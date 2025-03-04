import PlaylistsSection from "../sections/playlists-section";

interface PlaylistsViewProps {}

export default function PlaylistsView({}: PlaylistsViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <PlaylistsSection />
        </div>
    );
}

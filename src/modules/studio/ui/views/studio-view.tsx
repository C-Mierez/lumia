import VideosSection from "../sections/videos-section";

export default function StudioView() {
    return (
        <div>
            <div>
                <h1 className="font-brand text-2xl font-bold">Channel Content</h1>
                <p className="text-muted-foreground text-sm">Manage your channel&apos;s content and videos</p>
            </div>
            <VideosSection />
        </div>
    );
}

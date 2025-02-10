import VideosSection from "../sections/videos-section";

export default function StudioView() {
    return (
        <div className="flex flex-col gap-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Channel Content</h1>
                <p className="text-muted-foreground/75 text-sm">Manage your channel&apos;s content and videos</p>
            </div>
            <VideosSection />
        </div>
    );
}

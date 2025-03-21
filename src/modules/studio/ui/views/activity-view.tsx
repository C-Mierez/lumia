import ChannelComments from "../sections/channel-comments-section";
import ChannelStats from "../sections/channel-stats-section";
import ChannelSubscribers from "../sections/channel-subscribers-section";
import Features from "../sections/features-section";

import VideosSection from "../sections/videos-section";

export default function ActivityView() {
    return (
        <div className="flex w-full max-w-7xl flex-col gap-8">
            <div>
                <h1 className="font-brand text-2xl font-bold">Channel Activity</h1>
                <p className="text-muted-foreground text-sm">See your channel&apos;s activity and interactions</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <ChannelStats />
                <div className="flex flex-col gap-8">
                    <ChannelComments />
                    <ChannelSubscribers />
                </div>
                <Features />
            </div>
        </div>
    );
}

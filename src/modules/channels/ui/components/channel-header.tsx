import { ChannelsGetOneOutput } from "@/trpc/types";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import Image from "next/image";
import ChannelBanner, { ChannelBannerSkeleton } from "./channel-banner";
import { SubscribeButton } from "@modules/subscriptions/ui/components/subscribe-button";
import SubscribersPreview from "@modules/subscriptions/ui/components/subscribers-preview";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { Skeleton } from "@components/ui/skeleton";
import { useMemo } from "react";

interface ChannelHeaderProps {
    channel: ChannelsGetOneOutput;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
    return (
        <div className="flex w-full flex-col gap-8">
            {/* Banner */}
            <ChannelBanner channel={channel} />

            {/* User Data */}
            <div className="flex gap-4">
                {/* User Avatar */}
                <Avatar className="size-20 md:size-36">
                    <AvatarImage src={channel.imageUrl} />
                    <AvatarFallback></AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex flex-1 flex-col gap-2">
                    <h1 className="font-brand line-clamp-1 text-2xl md:text-4xl">{channel.name}</h1>
                    <ChannelStats channel={channel} />
                    <p className="text-muted-foreground line-clamp-1 max-w-1/2 text-sm">
                        {channel.description ?? "No description"}
                    </p>

                    {channel.isSubscribed !== null && (
                        <div className="flex items-center gap-4">
                            {channel.isOwner ? (
                                <Button asChild variant={"secondary"}>
                                    <Link href={`/studio`}>Studio</Link>
                                </Button>
                            ) : (
                                <SubscribeButton
                                    shouldRevalidate
                                    disabled={false}
                                    size={"default"}
                                    userId={channel.id}
                                    isSubscribed={channel.isSubscribed}
                                />
                            )}

                            <div className="flex-1">
                                <SubscribersPreview userId={channel.id} userName={channel.name} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ChannelHeaderSkeleton() {
    return (
        <div className="flex w-full flex-col gap-8">
            <ChannelBannerSkeleton />
            <div className="flex gap-4">
                <Skeleton className="size-36 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="line-clamp-1 w-1/4 text-4xl">&nbsp;</Skeleton>
                    <Skeleton className="line-clamp-1 w-1/2 text-sm">&nbsp;</Skeleton>
                    <Skeleton className="line-clamp-1 w-1/2 text-sm">&nbsp;</Skeleton>
                </div>
            </div>
        </div>
    );
}

function ChannelStats({ channel }: ChannelHeaderProps) {
    const subscriberCount = useMemo(
        () =>
            Intl.NumberFormat("en", {
                notation: "compact",
                compactDisplay: "short",
            }).format(channel.subscriberCount),
        [channel],
    );

    const videosCount = useMemo(
        () =>
            Intl.NumberFormat("en", {
                notation: "compact",
                compactDisplay: "short",
            }).format(channel.videosCount),
        [channel],
    );

    const viewsCount = useMemo(
        () =>
            Intl.NumberFormat("en", {
                notation: "compact",
                compactDisplay: "short",
            }).format(channel.viewsCount),
        [channel],
    );

    return (
        <div className="text-muted-foreground flex flex-col gap-[0.5ch] text-sm md:flex-row">
            <p className="shrink-0">
                {subscriberCount}
                {" subscribers"}
            </p>
            <p className="hidden md:block">{"-"}</p>
            <p className="hidden shrink-0 md:block">
                {videosCount}
                {" videos"}
            </p>
            <p className="hidden md:block">{"-"}</p>
            <p className="hidden shrink-0 md:block">
                {viewsCount}
                {" total views"}
            </p>
            <div className="flex gap-[0.5ch]">
                <p className="shrink-0 md:hidden">
                    {videosCount}
                    {" videos"}
                </p>
                <p className="md:hidden">{"-"}</p>
                <p className="shrink-0 md:hidden">
                    {viewsCount}
                    {" total views"}
                </p>
            </div>
        </div>
    );
}

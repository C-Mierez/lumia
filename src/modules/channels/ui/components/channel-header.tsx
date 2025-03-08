import { ChannelsGetOneOutput } from "@/trpc/types";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import Image from "next/image";
import ChannelBanner from "./channel-banner";
import { SubscribeButton } from "@modules/subscriptions/ui/components/subscribe-button";
import SubscribersPreview from "@modules/subscriptions/ui/components/subscribers-preview";
import { Button } from "@components/ui/button";
import Link from "next/link";

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
                <Avatar className="size-36">
                    <AvatarImage src={channel.imageUrl} />
                    <AvatarFallback></AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex flex-1 flex-col gap-2">
                    <h1 className="font-brand line-clamp-1 text-4xl">{channel.name}</h1>
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

function ChannelStats({ channel }: ChannelHeaderProps) {
    return (
        <div className="text-muted-foreground flex gap-[0.5ch] text-sm">
            <p>
                {Intl.NumberFormat("en", {
                    notation: "compact",
                    compactDisplay: "short",
                }).format(channel.subscriberCount)}
                {" subscribers"}
            </p>
            <p>{"-"}</p>
            <p>
                {Intl.NumberFormat("en", {
                    notation: "compact",
                    compactDisplay: "short",
                }).format(channel.videosCount)}
                {" videos"}
            </p>
            <p>{"-"}</p>
            <p>
                {Intl.NumberFormat("en", {
                    notation: "compact",
                    compactDisplay: "short",
                }).format(channel.viewsCount)}
                {" total views"}
            </p>
        </div>
    );
}

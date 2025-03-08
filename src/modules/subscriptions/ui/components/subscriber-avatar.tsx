import { SubscriptionsGetSubscribersOutput } from "@/trpc/types";
import BasicTooltip from "@components/basic-tooltip";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Skeleton } from "@components/ui/skeleton";
import { cn, getFullChannelUrl } from "@lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";

interface SubscriberAvatarProps {
    subscriber: SubscriptionsGetSubscribersOutput["items"][0];
    className?: string;
}

export default function SubscriberAvatar({ subscriber, className }: SubscriberAvatarProps) {
    return (
        <BasicTooltip label={subscriber.name} contentProps={{ side: "top" }}>
            <Link prefetch={false} href={getFullChannelUrl(subscriber.id)}>
                <Avatar className={cn("size-6", className)}>
                    <AvatarImage src={subscriber.imageUrl}></AvatarImage>
                    <AvatarFallback></AvatarFallback>
                </Avatar>
            </Link>
        </BasicTooltip>
    );
}

export function SubscriberAvatarSkeleton() {
    return <Skeleton className="size-8 rounded-full" />;
}

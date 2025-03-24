import Link from "next/link";

import { WatchGetOneOutput } from "@/trpc/types";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { SubscribeButton } from "@modules/subscriptions/ui/components/subscribe-button";
import UserName from "@modules/users/ui/components/user-name";

interface VideoAuthorProps {
    video: NonNullable<WatchGetOneOutput>;
    showButton?: boolean;
}

export function VideoAuthor({ video, showButton = false }: VideoAuthorProps) {
    const auth = useAuth();

    return (
        <div className="flex items-center justify-between gap-3 md:justify-start">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="size-10">
                    <AvatarImage src={video.user.imageUrl} alt={video.user.name} />
                </Avatar>
                {/* User Info */}
                <div className="flex flex-col justify-center">
                    <UserName userId={video.user.id} name={video.user.name} />
                    <div className="text-muted-foreground text-xs leading-4">
                        {video.user.subscriberCount} Subscribers
                    </div>
                </div>
            </div>
            {/* CTA*/}
            {showButton && (
                <div className="pl-3">
                    {/* Subscribe button if not owner */}
                    {auth.userId !== video.user.clerkId ? (
                        <SubscribeButton
                            shouldRevalidate
                            userId={video.user.id}
                            size={"default"}
                            disabled={!auth.isLoaded}
                            isSubscribed={video.currentUserSubscription}
                        />
                    ) : (
                        <Button asChild variant={"secondary"}>
                            <Link href={`/studio/video/${video.id}`}>Edit</Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

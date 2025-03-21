"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { SubscriptionsGetSubscribersOutput, SubscriptionsGetSubscribersQuery } from "@/trpc/types";
import InfiniteScroll from "@components/infinite-scroll";
import ResponsiveModal from "@components/responsive-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { ModalProps } from "@hooks/use-modal";
import { getFullChannelUrl } from "@lib/utils";

interface SubscribersListProps extends ModalProps {
    subscribersQuery: SubscriptionsGetSubscribersQuery;
    subscribers: SubscriptionsGetSubscribersOutput["items"];
    userName?: string;
}

export default function SubscribersList({
    isOpen = false,
    onOpenChange,
    openModal,
    closeModal,
    subscribersQuery,
    subscribers,
    userName,
}: SubscribersListProps) {
    return (
        <ResponsiveModal isOpen={isOpen} onOpenChange={onOpenChange} hideClose className="m-0 p-0">
            <div className="flex flex-col gap-4 p-4">
                {!!userName && (
                    <>
                        <h1>{userName}&apos;s Subscribers</h1>
                        <Separator />
                    </>
                )}

                <div className="flex flex-col gap-4">
                    {subscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center gap-4">
                            <Link href={getFullChannelUrl(subscriber.id)} className="flex flex-1 items-center gap-4">
                                <Avatar className="flex-shrink-0">
                                    <AvatarImage src={subscriber.imageUrl}></AvatarImage>
                                    <AvatarFallback>{subscriber.name}</AvatarFallback>
                                </Avatar>

                                <h2 className="line-clamp-1 text-sm">{subscriber.name}</h2>
                            </Link>
                            <span className="text-muted-foreground text-xs">
                                {formatDistanceToNow(subscriber.subscribedAt, { addSuffix: true })}
                            </span>
                        </div>
                    ))}
                </div>
                <InfiniteScroll
                    isManual
                    label="No more subscribers found"
                    hasNextPage={subscribersQuery.hasNextPage}
                    isFetchingNextPage={subscribersQuery.isFetchingNextPage}
                    fetchNextPage={subscribersQuery.fetchNextPage}
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant={"muted"} onClick={closeModal}>
                        Go Back
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}

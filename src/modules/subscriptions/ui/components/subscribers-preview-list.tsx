import { Suspense } from "react";

import { formatDistanceToNow } from "date-fns";
import { PlusIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import BasicTooltip from "@components/basic-tooltip";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import useModal from "@hooks/use-modal";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import SubscriberAvatar from "./subscriber-avatar";
import SubscribersList from "./subscribers-list-modal";

interface SubscribersPreviewListProps {
    userId?: string;
    userName?: string;
}

export default function SubscribersPreviewList(props: SubscribersPreviewListProps) {
    return (
        <Suspense fallback={<SubscribersPreviewListSkeleton />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <SubscribersPreviewListSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
}

function SubscribersPreviewListSuspense({ userId, userName }: SubscribersPreviewListProps) {
    const trpc = useTRPC();

    const getSubscribers = useSuspenseInfiniteQuery(
        trpc.subscriptions.getSubscribers.infiniteQueryOptions(
            {
                userId,
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    const subscribersModal = useModal({});

    const subscribers = getSubscribers.data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <>
            <SubscribersList
                {...subscribersModal}
                // eslint-disable-next-line
                subscribersQuery={getSubscribers as any}
                subscribers={subscribers}
                userName={userName}
            />
            <div className="flex flex-col gap-4">
                {subscribers.slice(0, DEFAULT_INFINITE_PREFETCH_LIMIT).map((subscriber) => (
                    <div key={subscriber.id} className="flex gap-2">
                        <SubscriberAvatar className="size-8" subscriber={subscriber} />
                        <div>
                            <div className="line-clamp-1 text-xs">{subscriber.name}</div>
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                                Subscribed {formatDistanceToNow(subscriber.subscribedAt, { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                ))}
                {subscribers.length > 0 && subscribers[0].totalSubscribers > DEFAULT_INFINITE_PREFETCH_LIMIT && (
                    <SubscribersExpandAvatar
                        onClick={() => {
                            if (getSubscribers.hasNextPage) getSubscribers.fetchNextPage();
                            subscribersModal.openModal();
                        }}
                    />
                )}
            </div>
        </>
    );
}

export function SubscribersPreviewListSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT + 1).map((i) => {
                return <Skeleton key={i} className="size-8 rounded-full" />;
            })}
        </div>
    );
}

function SubscribersExpandAvatar({ onClick }: { onClick: () => void }) {
    return (
        <Button variant={"muted"} onClick={onClick}>
            View More
        </Button>
    );
}

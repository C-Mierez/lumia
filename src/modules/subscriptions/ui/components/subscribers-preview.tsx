import { useTRPC } from "@/trpc/client";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SubscriberAvatar from "./subscriber-avatar";
import { Button } from "@components/ui/button";
import BasicTooltip from "@components/basic-tooltip";
import { range } from "@lib/utils";
import { Skeleton } from "@components/ui/skeleton";
import SubscribersList from "./subscribers-list-modal";
import useModal from "@hooks/use-modal";

interface SubscribersPreviewProps {
    userId: string;
    userName: string;
}

export default function SubscribersPreview(props: SubscribersPreviewProps) {
    return (
        <Suspense fallback={<SubscribersPreviewSkeleton />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <SubscribersPreviewSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
}

function SubscribersPreviewSuspense({ userId, userName }: SubscribersPreviewProps) {
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
            <div className="flex items-center gap-2">
                {subscribers.slice(0, DEFAULT_INFINITE_PREFETCH_LIMIT).map((subscriber) => (
                    <SubscriberAvatar key={subscriber.id} subscriber={subscriber} />
                ))}
                {subscribers.length > 0 && subscribers[0].totalSubscribers > DEFAULT_INFINITE_PREFETCH_LIMIT && (
                    <SubscribersExpandAvatar onClick={subscribersModal.openModal} />
                )}
            </div>
        </>
    );
}

export function SubscribersPreviewSkeleton() {
    return (
        <div className="flex items-center gap-2">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT + 1).map((i) => {
                return <Skeleton key={i} className="size-6 rounded-full" />;
            })}
        </div>
    );
}

function SubscribersExpandAvatar({ onClick }: { onClick: () => void }) {
    return (
        <BasicTooltip label="View more" contentProps={{ side: "top" }}>
            <Button className="size-6 rounded-full" size={"icon"} variant={"muted"} onClick={onClick}>
                <PlusIcon />
            </Button>
        </BasicTooltip>
    );
}

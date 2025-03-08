"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import InfiniteScroll from "@components/infinite-scroll";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { VideoList } from "@modules/home/ui/components/video-list";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import ChannelHeader from "../components/channel-header";
import ChannelNavigation from "../components/channel-navigation";
import { Separator } from "@components/ui/separator";

interface ChannelSectionProps {
    userId: string;
}

export default function ChannelSection({ userId }: ChannelSectionProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelSectionSuspense({ userId }: ChannelSectionProps) {
    const trpc = useTRPC();

    const { data: channel } = useSuspenseQuery(trpc.channels.getOne.queryOptions({ userId }));

    return (
        <>
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 p-4">
                <ChannelHeader channel={channel} />

                <ChannelNavigation />
            </div>
        </>
    );
}

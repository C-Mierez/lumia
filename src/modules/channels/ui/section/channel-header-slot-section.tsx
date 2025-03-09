"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import ChannelHeader from "../components/channel-header";

interface ChannelHeaderSlotSectionProps {
    userId: string;
}

export default function ChannelHeaderSlotSection({ userId }: ChannelHeaderSlotSectionProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelHeaderSlotSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelHeaderSlotSectionSuspense({ userId }: ChannelHeaderSlotSectionProps) {
    const trpc = useTRPC();

    const { data: channel } = useSuspenseQuery(trpc.channels.getOne.queryOptions({ userId }));

    return (
        <>
            <ChannelHeader channel={channel} />
        </>
    );
}

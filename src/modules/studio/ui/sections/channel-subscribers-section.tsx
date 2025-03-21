"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Separator } from "@components/ui/separator";

import StatsCard from "../components/stats-card";

interface ChannelSubscribersProps {}

export default function ChannelSubscribers(props: ChannelSubscribersProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelSubscribersSuspense {...props} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelSubscribersSuspense({}: ChannelSubscribersProps) {
    return (
        <>
            <StatsCard>
                <h2 className="text-lg">Recent Subscribers</h2>

                <p className="text-muted-foreground text-sm">Current Subscribers</p>
                <p className="text-sm">10</p>

                <Separator />

                <div className="flex justify-between gap-2">
                    <p className="text-muted-foreground text-sm">Current Subscribers</p>
                    <p className="text-sm">10</p>
                </div>
            </StatsCard>
        </>
    );
}

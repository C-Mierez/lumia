"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Separator } from "@components/ui/separator";

import StatsCard from "../components/stats-card";
import SubscribersPreview from "@modules/subscriptions/ui/components/subscribers-preview";
import { useAuth } from "@clerk/nextjs";
import SubscribersPreviewList from "@modules/subscriptions/ui/components/subscribers-preview-list";

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
    const { userId } = useAuth();

    return (
        <>
            <StatsCard>
                <h2 className="text-lg">Recent Subscribers</h2>

                <SubscribersPreviewList />
            </StatsCard>
        </>
    );
}

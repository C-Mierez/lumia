"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import SubscribersPreviewList from "@modules/subscriptions/ui/components/subscribers-preview-list";

import StatsCard from "../components/stats-card";

interface ChannelSubscribersProps {}

export default function ChannelSubscribers(props: ChannelSubscribersProps) {
    return (
        <>
            <Suspense fallback={<ChannelSubscribersSuspense />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelSubscribersSuspense {...props} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelSubscribersSuspense({}: ChannelSubscribersProps) {
    return (
        <StatsCard>
            <h2 className="text-lg">Recent Subscribers</h2>

            <SubscribersPreviewList />
        </StatsCard>
    );
}

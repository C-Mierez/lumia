"use client";

import { Suspense } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Separator } from "@components/ui/separator";

import StatsCard from "../components/stats-card";

interface ChannelCommentsProps {}

export default function ChannelComments(props: ChannelCommentsProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelCommentsSuspense {...props} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelCommentsSuspense({}: ChannelCommentsProps) {
    return (
        <>
            <StatsCard>
                <h2 className="text-lg">Latest Comments</h2>

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

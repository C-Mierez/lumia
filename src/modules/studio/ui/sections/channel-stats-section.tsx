"use client";

import { Suspense, useMemo } from "react";

import { Loader2Icon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { Separator } from "@components/ui/separator";
import { GridVideoCard } from "@modules/videos/ui/components/video-cards/grid-video-card";
import { useSuspenseQuery } from "@tanstack/react-query";

import StatsCard from "../components/stats-card";

interface ChannelStatsProps {}

export default function ChannelStats(props: ChannelStatsProps) {
    return (
        <>
            <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelStatsSuspense {...props} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

function ChannelStatsSuspense({}: ChannelStatsProps) {
    const trpc = useTRPC();

    const { data } = useSuspenseQuery(trpc.studio.getChannelStats.queryOptions());

    const totalSubscribers = useMemo(() => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        }).format(data.subscriberCount);
    }, [data]);

    const totalViews = useMemo(() => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        }).format(data.totalViews);
    }, [data]);

    const totalComments = useMemo(() => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        }).format(data.totalComments);
    }, [data]);

    const totalLikes = useMemo(() => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        }).format(data.totalLikes);
    }, [data]);

    const totalDislikes = useMemo(() => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        }).format(data.totalDislikes);
    }, [data]);

    return (
        <>
            <StatsCard>
                <h2 className="text-lg">Channel Analytics</h2>

                <p className="text-muted-foreground text-sm">Current Subscribers</p>
                <p className="text-2xl">{totalSubscribers}</p>

                <Separator />

                <div className="flex justify-between gap-2">
                    <p className="text-muted-foreground text-sm">Total Views</p>
                    <p className="text-sm">{totalViews}</p>
                </div>
                <div className="flex justify-between gap-2">
                    <p className="text-muted-foreground text-sm">Total Comments</p>
                    <p className="text-sm">{totalComments}</p>
                </div>
                <div className="flex justify-between gap-2">
                    <p className="text-muted-foreground text-sm">Total Likes</p>
                    <p className="text-sm">{totalLikes}</p>
                </div>
                <div className="flex justify-between gap-2">
                    <p className="text-muted-foreground text-sm">Total Dislikes</p>
                    <p className="text-sm">{totalDislikes}</p>
                </div>
                <Separator />

                <div className="flex flex-col gap-4">
                    <h3>Top Video</h3>
                    <GridVideoCard video={data.video} />
                </div>
            </StatsCard>
        </>
    );
}

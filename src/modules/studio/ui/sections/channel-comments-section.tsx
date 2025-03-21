"use client";

import { Suspense } from "react";

import { formatDistanceToNow } from "date-fns";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import BasicTooltip from "@components/basic-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Separator } from "@components/ui/separator";
import { getFullVideoUrl } from "@lib/utils";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";
import { useSuspenseQuery } from "@tanstack/react-query";

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
    const trpc = useTRPC();

    const { data } = useSuspenseQuery(trpc.studio.getLatestComments.queryOptions());

    return (
        <StatsCard>
            <h2 className="text-lg">Latest Comments</h2>

            <div className="flex flex-col gap-3">
                {data.map((comment) => (
                    <>
                        <div key={comment.comments.id} className="flex items-end justify-between gap-3">
                            <div className="flex flex-1 gap-2">
                                <Avatar className="size-6">
                                    <AvatarImage src={comment.users.imageUrl}></AvatarImage>
                                    <AvatarFallback>{comment.users.name}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col justify-between gap-2">
                                    <p className="text-muted-foreground line-clamp-1 text-xs">
                                        <span>{comment.users.name}</span>
                                        <span>{" - "}</span>
                                        <span>
                                            {formatDistanceToNow(comment.comments.createdAt, { addSuffix: true })}
                                        </span>
                                    </p>
                                    <p className="line-clamp-2 text-sm">{comment.comments.text}</p>
                                </div>
                            </div>
                            <BasicTooltip contentProps={{ side: "right" }} label={comment["user-videos"].title}>
                                <Link className="w-20" href={getFullVideoUrl(comment["user-videos"].id)}>
                                    <VideoThumbnail
                                        duration={comment["user-videos"].duration ?? 0}
                                        title=""
                                        imageUrl={comment["user-videos"].thumbnailUrl}
                                        previewUrl={comment["user-videos"].previewUrl}
                                    />
                                </Link>
                            </BasicTooltip>
                        </div>
                        <Separator key={`sep-${comment.comments.id}`} />
                    </>
                ))}
            </div>
        </StatsCard>
    );
}

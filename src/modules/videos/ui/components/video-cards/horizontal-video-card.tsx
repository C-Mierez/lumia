"use client";

import { useMemo } from "react";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { SuggestionsGetManyOutput } from "@/trpc/types";
import { getFullChannelUrl } from "@lib/utils";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

import VideoMenu from "../video-menu";

interface HorizontalVideoCardProps {
    video: SuggestionsGetManyOutput["items"][0];
    href: string;
}

export function HorizontalVideoCard({ video, href }: HorizontalVideoCardProps) {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(video.viewCount);
    }, [video]);

    return (
        <div className="group relative isolate flex gap-3">
            <div className="w-[35%]">
                <VideoThumbnail
                    title={video.title}
                    imageUrl={video.thumbnailUrl}
                    previewUrl={video.previewUrl}
                    duration={video.duration ?? 0}
                />
            </div>
            <div className="flex flex-1 flex-col gap-1">
                <p className="font-brand line-clamp-2 text-sm">{video.title ?? "Untitled"}</p>
                {/* <p className="text-muted-foreground line-clamp-2 text-xs">
                    {video.description ?? "No video description"}
                </p> */}
                <div className="pointer-events-none z-20">
                    <Link
                        href={getFullChannelUrl(video.users.id)}
                        className="text-muted-foreground pointer-events-auto z-50 line-clamp-1 w-fit text-xs"
                    >
                        {video.users.name}
                    </Link>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                        <span>{compactViews} views</span>
                        <span>{" - "}</span>
                        <span>{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
                    </p>
                </div>
            </div>
            <div className="z-50 size-min">
                <VideoMenu videoId={video.id} isSmall />
            </div>
            <Link href={href} className="absolute inset-0" />
        </div>
    );
}

"use client";
import { useMemo } from "react";

import { formatDistanceToNow } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

import { HomeSearchManyOutput } from "@/trpc/types";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import UserName from "@modules/users/ui/components/user-name";

import VideoThumbnail from "../video-thumbnail";
import { getFullVideoUrl } from "@lib/utils";
import { Skeleton } from "@components/ui/skeleton";

interface GridVideoCardProps {
    video: HomeSearchManyOutput["items"][0];
}

export function GridVideoCard({ video }: GridVideoCardProps) {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(video.viewCount);
    }, [video]);

    return (
        <div className="relative flex max-h-full max-w-full flex-col gap-2">
            <VideoThumbnail
                title={video.title}
                imageUrl={video.thumbnailUrl}
                previewUrl={video.previewUrl}
                duration={video.duration ?? 0}
            />

            <div className="flex items-start justify-between gap-3">
                <Link href={"/users/current"}>
                    <Avatar className="size-8 lg:size-9">
                        <AvatarImage src={video.users.imageUrl} />
                        <AvatarFallback>2</AvatarFallback>
                    </Avatar>
                </Link>

                <div className="z-20 flex flex-1 flex-col">
                    <div className="text-brand line-clamp-2 text-start font-bold lg:text-base">{video.title}</div>
                    <UserName
                        userId={video.users.id}
                        name={video.users.name}
                        className="text-muted-foreground text-sm font-normal"
                    />
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                        <span>{compactViews} views</span>
                        <span>{" - "}</span>
                        <span>{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
                    </p>
                </div>
                <div className="z-50 size-min">
                    <Button size={"smallIcon"} variant={"ghost"}>
                        <MoreVerticalIcon />
                    </Button>
                </div>
                <Link href={getFullVideoUrl(video.id)} className="absolute inset-0" />
            </div>
        </div>
    );
}

export function GridVideoCardSkeleton() {
    return (
        <div className="relative flex max-h-full max-w-full flex-col gap-2">
            <Skeleton className="aspect-video size-full" />
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-1 items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-fit w-1/3 text-base">&nbsp;</Skeleton>
                </div>
            </div>
        </div>
    );
}

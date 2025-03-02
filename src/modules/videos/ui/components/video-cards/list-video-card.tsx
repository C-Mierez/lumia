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

interface ListVideoCardProps {
    video: HomeSearchManyOutput["items"][0];
}

export function ListVideoCard({ video }: ListVideoCardProps) {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(video.viewCount);
    }, [video]);

    return (
        <div className="relative grid w-full max-w-full grid-cols-3 gap-3">
            <div className="aspect-video size-full">
                <VideoThumbnail
                    title={video.title}
                    imageUrl={video.thumbnailUrl}
                    previewUrl={video.previewUrl}
                    duration={video.duration ?? 0}
                />
            </div>

            <div className="col-span-2 flex w-full items-start justify-between gap-3">
                <div className="z-20 flex flex-1 flex-col">
                    <div className="text-brand line-clamp-2 text-start text-lg font-bold lg:text-xl">{video.title}</div>
                    <div className="flex gap-3">
                        <p className="text-muted-foreground line-clamp-1 text-sm">
                            <span>{compactViews} views</span>
                            <span>{" - "}</span>
                            <span>{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <Link href={"/users/current"}>
                            <Avatar className="size-6 lg:size-8">
                                <AvatarImage src={video.users.imageUrl} />
                                <AvatarFallback>2</AvatarFallback>
                            </Avatar>
                        </Link>
                        {/* // TODO Link to user channel */}
                        <UserName name={video.users.name} className="text-muted-foreground text-sm font-normal" />
                    </div>
                    <div>
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{video.description}</p>
                    </div>
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

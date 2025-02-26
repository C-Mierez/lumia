"use client";

import { useMemo, useState } from "react";

import { format, formatDistanceToNow } from "date-fns";
import { CircleDollarSignIcon, User2Icon, VideoIcon } from "lucide-react";

import { WatchGetOneOutput } from "@/trpc/types";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { cn } from "@lib/utils";

import { VideoAuthor } from "./video-author";

interface VideoDescriptionProps {
    video: NonNullable<WatchGetOneOutput>;
}

export default function VideoDescription({ video }: VideoDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(video.views.count);
    }, [video, video.views.count]);
    const expandedViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "standard",
        }).format(video.views.count);
    }, [video, video.views.count]);

    const compactCreation = useMemo(() => {
        return formatDistanceToNow(video.createdAt, { addSuffix: true });
    }, [video, video.createdAt]);
    const expandedCreation = useMemo(() => {
        return format(video.createdAt, "d MMM yyyy");
    }, [video, video.createdAt]);

    const views = isExpanded ? expandedViews : compactViews;
    const creation = isExpanded ? expandedCreation : compactCreation;

    return (
        <div className="text-muted-foreground relative flex flex-col items-start gap-3 text-sm">
            {/* Click expand overlay */}
            <button
                className={cn(
                    "hover:bg-foreground/2 absolute -inset-4.5 cursor-pointer transition-colors",
                    isExpanded && "pointer-events-none hidden",
                )}
                onClick={() => setIsExpanded(true)}
            />
            <div className="flex flex-col gap-1">
                <div className="text-foreground flex gap-4 text-sm">
                    <span>{views} views</span>
                    <span>Uploaded {creation}</span>
                </div>
                <p className={cn(isExpanded ? "" : "line-clamp-1")}>{video.description}</p>
            </div>
            {/* Expanded-only content */}
            {isExpanded && <ExpandedArea video={video} />}
            <Button variant={"link"} className="px-0 text-sm" onClick={() => setIsExpanded((prev) => !prev)}>
                {isExpanded ? "Show less" : "Show more"}...
            </Button>
        </div>
    );
}

function ExpandedArea({ video }: VideoDescriptionProps) {
    return (
        <>
            <Separator />
            {/* Transcript Area */}
            <div>
                <h2 className="text-foreground text-lg">Transcription</h2>
                <p className="text-sm">Follow along with the transcript</p>
                <Button variant={"muted"} size={"sm"} className="mt-4">
                    Get Transcription
                </Button>
            </div>
            <Separator />
            {/* User Area */}
            <div className="flex flex-col gap-4">
                <VideoAuthor video={video} />
                {/* TODO Add Links */}
                <div className="flex gap-2">
                    <Button variant={"muted"} size={"sm"}>
                        <User2Icon /> About
                    </Button>
                    <Button variant={"muted"} size={"sm"}>
                        <VideoIcon /> Videos
                    </Button>
                    <Button variant={"muted"} size={"sm"}>
                        <CircleDollarSignIcon /> Support
                    </Button>
                </div>
            </div>
            <Separator />
            {/* User Area */}
            <div>
                {/* TODO License */}
                <h2 className="text-foreground text-lg">License</h2>
                <p className="text-sm">
                    This video is licensed under the Creative Commons Attribution 4.0 International license (not really)
                </p>
            </div>
        </>
    );
}

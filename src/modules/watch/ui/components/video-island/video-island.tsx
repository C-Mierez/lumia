"use client";
import { useTRPC } from "@/trpc/client";
import { WatchGetOneOutput } from "@/trpc/types";
import { useAuth } from "@clerk/nextjs";
import { Separator } from "@components/ui/separator";
import VideoPlayer from "@modules/videos/ui/components/video-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { VideoAuthor } from "./video-author";
import VideoDescription from "./video-description";
import { VideoInteractions } from "./video-interactions";

interface VideoIslandProps {
    video: NonNullable<WatchGetOneOutput>;
}

export function VideoIsland({ video }: VideoIslandProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const createView = useMutation(
        trpc.watch.createView.mutationOptions({
            async onSuccess() {
                await queryClient.invalidateQueries({ queryKey: trpc.watch.getOne.queryKey({ videoId: video.id }) });
            },
        }),
    );

    const handleViewVideo = () => {
        createView.mutate({ videoId: video.id });
    };

    return (
        <div className="bg-background-alt flex flex-col gap-4 overflow-hidden rounded-md">
            <div className="aspect-video overflow-hidden rounded-t-lg">
                <VideoPlayer
                    playbackId={video?.muxPlaybackId}
                    thumbnailUrl={video?.thumbnailUrl}
                    onPlay={handleViewVideo}
                />
            </div>
            <div className="flex flex-col gap-4 px-4 pb-4">
                {/* Title */}
                <div className="font-brand text-xl">{video?.title}</div>
                {/* CTA */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Author Data */}
                    <VideoAuthor video={video} showButton />

                    {/* Interactions */}
                    <VideoInteractions video={video} />
                </div>

                <Separator />

                {/* Description */}
                <VideoDescription video={video} />
            </div>
        </div>
    );
}

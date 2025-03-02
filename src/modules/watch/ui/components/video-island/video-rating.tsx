"use client";
import { useState } from "react";

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { WatchGetOneOutput } from "@/trpc/types";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface VideoRatingProps {
    video: NonNullable<WatchGetOneOutput>;
}

export function VideoRating({ video }: VideoRatingProps) {
    const { isSignedIn } = useAuth();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [optimisticReaction, setOptimisticReaction] = useState(video.currentUserReaction);

    const createReaction = useMutation(
        trpc.watch.createReaction.mutationOptions({
            async onSuccess(data) {
                if (data) {
                    toast.success(`${data.reactionType === "like" ? "Liked" : "Disliked"} video`);
                    setOptimisticReaction(data.reactionType);
                    await queryClient.invalidateQueries({
                        queryKey: trpc.playlists.getManyLiked.queryKey(),
                    });
                }
                if (data === null) {
                    toast.success("Removed reaction");
                    setOptimisticReaction(null);
                }
                await queryClient.invalidateQueries({
                    queryKey: trpc.watch.getOne.queryKey({ videoId: video.id }),
                });
            },
            onError(err) {
                toast.error(err.message);
            },
        }),
    );

    const onLike = () => {
        if (!isSignedIn) return;
        setOptimisticReaction(optimisticReaction === "like" ? null : "like");
        createReaction.mutate({ videoId: video.id, reaction: "like" });
    };

    const onDislike = () => {
        if (!isSignedIn) return;
        setOptimisticReaction(optimisticReaction === "dislike" ? null : "dislike");
        createReaction.mutate({ videoId: video.id, reaction: "dislike" });
    };

    const didUserLike = optimisticReaction === "like";
    const didUserDislike = optimisticReaction === "dislike";

    const likeCount = video.reactions.likesCount;
    const dislikeCount = video.reactions.dislikesCount;

    return (
        <div>
            <Button
                size={"lg"}
                className="rounded-r-none border"
                variant={didUserLike ? "secondary" : "outlineLight"}
                onClick={onLike}
            >
                <ThumbsUpIcon />
                <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
                size={"lg"}
                className="hover:bg-destructive border-l-none rounded-l-none border"
                variant={didUserDislike ? "destructive" : "outlineLight"}
                onClick={onDislike}
            >
                <ThumbsDownIcon />
                <span className="text-xs">{dislikeCount}</span>
            </Button>
        </div>
    );
}

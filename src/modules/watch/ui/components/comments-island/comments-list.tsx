import { useMemo, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { FlagIcon, MoreVerticalIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { WatchGetManyCommentsOutput, WatchGetManyCommentsQuery } from "@/trpc/types";
import { useAuth, useUser } from "@clerk/nextjs";
import InfiniteScroll from "@components/infinite-scroll";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CommentsForm } from "./comments-form";
import { CommentReplies } from "./comments-replies";

interface CommentsListProps {
    comments: WatchGetManyCommentsOutput["comments"];
    query: WatchGetManyCommentsQuery;
}

export function CommentsList({ comments, query }: CommentsListProps) {
    return (
        <div className="mt-2 flex flex-col gap-6">
            {comments.map((comment, i) => (
                <div key={`${i}${comment.comments.id}`}>
                    <CommentItem comment={comment} />
                    <CommentReplies
                        videoId={comment.comments.videoId}
                        parentId={comment.comments.id}
                        count={comment.reactions.repliesCount}
                    />
                </div>
            ))}
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
                label="No more comments found."
                isManual
            />
        </div>
    );
}

interface CommentItemProps {
    comment: WatchGetManyCommentsOutput["comments"][0];
}

export function CommentItem({ comment }: CommentItemProps) {
    const { isSignedIn, user } = useUser();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);

    const commentDate = useMemo(() => {
        return formatDistanceToNow(comment.comments.updatedAt, { addSuffix: true });
    }, [comment, comment.comments.updatedAt]);

    const deleteComment = useMutation(
        trpc.watch.deleteComment.mutationOptions({
            async onSuccess() {
                toast.success("Comment deleted successfully");
                await queryClient.invalidateQueries({ queryKey: trpc.watch.getManyComments.queryKey() });
            },
            onError() {
                toast.error("Failed to delete comment");
            },
        }),
    );

    const onDeleteComment = async () => {
        deleteComment.mutate({ commentId: comment.comments.id });
    };

    const isUserComment = !!isSignedIn && comment.users.clerkId === user?.id;

    const isRoot = comment.comments.parentId === null;

    return (
        // TODO Add links to user profiles
        <div className="flex items-start gap-3">
            <Avatar className={cn(isRoot ? "size-10" : "size-7")}>
                <AvatarImage src={comment.users.imageUrl} alt={comment.users.name ?? "Anonymous"} />
                <AvatarFallback>
                    <Skeleton className="rounded-full" />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-end gap-2">
                    <p className="text-xs">@{comment.users.name}</p>
                    <span className="text-muted-foreground text-xs">{commentDate}</span>
                </div>
                <p className="text-sm break-words">{comment.comments.text}</p>
                <CommentInteractions comment={comment} />
            </div>
            <div className="z-10">
                <CommentMenu onDelete={isUserComment ? onDeleteComment : undefined} />
            </div>
        </div>
    );
}

interface CommentInteractionsProps {
    comment: WatchGetManyCommentsOutput["comments"][0];
}

function CommentInteractions({ comment }: CommentInteractionsProps) {
    const { isSignedIn } = useAuth();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const isRoot = comment.comments.parentId === null;

    const [isReplying, setIsReplying] = useState(false);

    const [optimisticReaction, setOptimisticReaction] = useState(comment.currentUserReaction);

    const createReaction = useMutation(
        trpc.watch.createCommentReaction.mutationOptions({
            async onSuccess(data) {
                if (data) {
                    toast.success(`${data.reactionType === "like" ? "Liked" : "Disliked"} video`);
                    setOptimisticReaction(data.reactionType);
                }
                if (data === null) {
                    toast.success("Removed reaction");
                    setOptimisticReaction(null);
                }
                await queryClient.invalidateQueries({
                    queryKey: trpc.watch.getManyComments.queryKey(),
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
        createReaction.mutate({ videoId: comment.comments.videoId, commentId: comment.comments.id, reaction: "like" });
    };

    const onDislike = () => {
        if (!isSignedIn) return;
        setOptimisticReaction(optimisticReaction === "dislike" ? null : "dislike");
        createReaction.mutate({
            videoId: comment.comments.videoId,
            commentId: comment.comments.id,
            reaction: "dislike",
        });
    };

    const didUserLike = optimisticReaction === "like";
    const didUserDislike = optimisticReaction === "dislike";

    const likeCount = comment.reactions.likesCount + (createReaction.isPending && didUserLike ? 1 : 0);
    const dislikeCount = comment.reactions.dislikesCount + (createReaction.isPending && didUserDislike ? 1 : 0);

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <Button variant={didUserLike ? "secondary" : "ghost"} size={"smallIcon"} onClick={onLike}>
                        <ThumbsUpIcon />
                    </Button>
                    <div className="text-muted-foreground text-xs">{likeCount}</div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size={"smallIcon"}
                        variant={didUserDislike ? "destructive" : "ghost"}
                        className="hover:bg-destructive"
                        onClick={onDislike}
                    >
                        <ThumbsDownIcon />
                    </Button>
                    <div className="text-muted-foreground text-xs">{dislikeCount}</div>
                </div>
                {isRoot && (
                    <Button
                        className="text-xs font-semibold"
                        size={"sm"}
                        variant={"link"}
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        Reply
                    </Button>
                )}
            </div>
            {isReplying && (
                <div className="mt-3">
                    <CommentsForm
                        videoId={comment.comments.videoId}
                        parentId={comment.comments.id}
                        isRoot={false}
                        onCancel={() => {
                            setIsReplying(false);
                        }}
                    />
                </div>
            )}
        </>
    );
}

function CommentMenu({ onDelete }: { onDelete?: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"}>
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <FlagIcon />
                    Report
                </DropdownMenuItem>
                {!!onDelete && (
                    <>
                        <Separator />
                        <DropdownMenuItem variant="destructive" onClick={onDelete}>
                            <Trash2Icon />
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

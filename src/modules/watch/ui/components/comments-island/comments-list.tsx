import { useMemo } from "react";

import { formatDistanceToNow } from "date-fns";
import { FlagIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { WatchGetManyCommentsOutput, WatchGetManyCommentsQuery } from "@/trpc/types";
import { useUser } from "@clerk/nextjs";
import InfiniteScroll from "@components/infinite-scroll";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { Skeleton } from "@components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentsListProps {
    comments: WatchGetManyCommentsOutput["comments"];
    query: WatchGetManyCommentsQuery;
}

export function CommentsList({ comments, query }: CommentsListProps) {
    return (
        <div className="mt-2 flex flex-col gap-4">
            {comments.map((comment, i) => (
                <CommentItem key={`${i}${comment.comments.id}`} comment={comment} />
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

function CommentItem({ comment }: CommentItemProps) {
    const { isSignedIn, user } = useUser();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

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

    const isUserComment = isSignedIn ? true : false && comment.users.clerkId === user?.id;

    return (
        // TODO Add links to user profiles
        <div className="flex items-start gap-3">
            <Avatar className="size-10">
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
                <p className="break-words">{comment.comments.text}</p>
            </div>
            <div className="z-10">
                <CommentMenu onDelete={isUserComment ? onDeleteComment : undefined} />
            </div>
        </div>
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

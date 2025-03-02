"use client";

import { useEffect, useState } from "react";

import { ChevronDownIcon, ChevronUpIcon, CornerDownRightIcon, Loader2Icon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@components/ui/button";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { useInfiniteQuery } from "@tanstack/react-query";

import { CommentItem } from "./comments-list";

interface CommentRepliesProps {
    videoId: string;
    parentId: number;
    count?: number;
}

export function CommentReplies({ videoId, parentId, count }: CommentRepliesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <div className="ml-13">
            {count && count !== 0 && (
                <Button
                    variant={"link"}
                    size={"link"}
                    className="text-xs"
                    disabled={isLoading}
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    {isLoading ? (
                        <Loader2Icon className="animate-spin" />
                    ) : isExpanded ? (
                        <ChevronUpIcon />
                    ) : (
                        <ChevronDownIcon />
                    )}
                    <span>
                        {isExpanded ? "Hide" : "Show"} {count ?? 0} replies
                    </span>
                </Button>
            )}
            {isExpanded && <CommentRepliesList videoId={videoId} parentId={parentId} onLoading={onLoading} />}
        </div>
    );
}

function CommentRepliesList({
    videoId,
    parentId,
    onLoading,
}: {
    videoId: string;
    parentId: number;
    onLoading: (loading: boolean) => void;
}) {
    const trpc = useTRPC();

    const { isLoading, data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        trpc.watch.getManyComments.infiniteQueryOptions(
            {
                videoId,
                parentId,
                limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        ),
    );

    useEffect(() => {
        onLoading(isLoading);
    }, [isLoading, onLoading]);

    const comments = data?.pages.flatMap((page) => page.comments) ?? [];

    return (
        <div className="mt-2 flex flex-col gap-2">
            {!isLoading &&
                comments.map((comment, i) => <CommentItem key={`${i}${comment.comments.id}`} comment={comment} />)}

            {/* Manual custom infinite scroll component */}
            {!isLoading && hasNextPage && (
                <div className="mt-2">
                    <Button
                        variant={"link"}
                        size={"link"}
                        className="text-xs"
                        onClick={() => {
                            fetchNextPage();
                        }}
                        disabled={isFetchingNextPage}
                    >
                        <CornerDownRightIcon />
                        Show more
                    </Button>
                </div>
            )}
        </div>
    );
}

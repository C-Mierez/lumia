"use client";

import { useEffect } from "react";

import { Loader2Icon } from "lucide-react";

import useIntersectionObserver from "@hooks/use-intersection-observer";

import { Button } from "./ui/button";

interface InfiniteScrollProps {
    isManual?: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    label?: string;
}

export default function InfiniteScroll({
    isManual = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    label = "No more videos found.",
}: InfiniteScrollProps) {
    const { targetRef, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: "100px",
    });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage, isManual]);

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <div ref={targetRef} className="pointer-events-none invisible size-1" />
            {!!hasNextPage ? (
                <Button disabled={isFetchingNextPage || !hasNextPage} onClick={fetchNextPage} variant={"muted"}>
                    {isFetchingNextPage ? <Loader2Icon className="animate-spin" /> : "Load More"}
                </Button>
            ) : (
                <p className="text-muted-foreground text-xs">{label}</p>
            )}
        </div>
    );
}

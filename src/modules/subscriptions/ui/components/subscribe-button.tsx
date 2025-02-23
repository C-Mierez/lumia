"use client";

import { useState } from "react";

import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SubscribeButtonProps {
    shouldRevalidate?: boolean;
    disabled: boolean;
    isSubscribed: boolean;
    userId: string;
    className?: string;
    size: React.ComponentProps<typeof Button>["size"];
}

export function SubscribeButton({
    disabled,
    isSubscribed,
    userId,
    className,
    size,
    shouldRevalidate = false,
}: SubscribeButtonProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [isSubscribedState, setIsSubscribedState] = useState(isSubscribed);

    const onSuccess = async () => {
        if (shouldRevalidate) {
            await queryClient.invalidateQueries({ queryKey: trpc.watch.getOne.queryKey() });
        }
        toast.success(isSubscribedState ? "Unsubscribed" : "Subscribed");
    };

    const createSubscription = useMutation(trpc.users.createSubscription.mutationOptions({ onSuccess }));
    const deleteSubscription = useMutation(trpc.users.deleteSubscription.mutationOptions({ onSuccess }));

    const onSubscribe = async () => {
        await createSubscription.mutateAsync({ userId: userId });
        setIsSubscribedState(true);
    };

    const onUnsubscribe = async () => {
        await deleteSubscription.mutateAsync({ userId: userId });
        setIsSubscribedState(false);
    };

    return (
        <Button
            className={className}
            onClick={isSubscribedState ? onUnsubscribe : onSubscribe}
            disabled={disabled || createSubscription.isPending || deleteSubscription.isPending}
            size={size}
            variant={isSubscribed ? "muted" : "secondary"}
        >
            {isSubscribed ? "Subscribed" : "Subscribe"}
        </Button>
    );
}

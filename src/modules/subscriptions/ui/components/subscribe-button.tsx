"use client";

import { useState } from "react";

import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
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
    const { isSignedIn } = useAuth();
    const { openSignIn } = useClerk();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [isSubscribedState, setIsSubscribedState] = useState(isSubscribed);

    const onSuccess = async () => {
        if (shouldRevalidate) {
            await queryClient.invalidateQueries({ queryKey: trpc.watch.getOne.queryKey() });
            await queryClient.invalidateQueries({ queryKey: trpc.home.searchManySubscriptions.queryKey() });
            await queryClient.invalidateQueries({ queryKey: trpc.subscriptions.getMany.queryKey() });
        }
        toast.success(isSubscribedState ? "Unsubscribed" : "Subscribed");
    };

    const createSubscription = useMutation(trpc.subscriptions.createSubscription.mutationOptions({ onSuccess }));
    const deleteSubscription = useMutation(trpc.subscriptions.deleteSubscription.mutationOptions({ onSuccess }));

    const onSubscribe = async () => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }
        await createSubscription.mutateAsync({ userId: userId });
        setIsSubscribedState(true);
    };

    const onUnsubscribe = async () => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }
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

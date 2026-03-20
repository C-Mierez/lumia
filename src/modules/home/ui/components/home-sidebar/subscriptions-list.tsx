"use client";

import { Suspense } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@components/ui/avatar";
import { Separator } from "@components/ui/separator";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon, Smile } from "lucide-react";
import { getFullChannelUrl } from "@lib/utils";
import { Button } from "@components/ui/button";

export default function SubscriptionsList() {
    const { isLoaded, isSignedIn } = useAuth();
    const pathname = usePathname();

    if (!isLoaded) {
        return (
            <>
                <Separator />
                <SubscriptionsListSkeleton />
            </>
        );
    }

    if (!isSignedIn) {
        return (
            <>
                <Separator />
                <SubscriptionsListLoggedOut />
            </>
        );
    }

    return (
        <>
            <Separator />

            <Suspense fallback={<SubscriptionsListSkeleton />}>
                <SubscriptionsListSuspense pathname={pathname} />
            </Suspense>
        </>
    );
}

interface SubscriptionsListSuspenseProps {
    pathname: string;
}

function SubscriptionsListSuspense({ pathname }: SubscriptionsListSuspenseProps) {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.subscriptions.getMany.queryOptions());

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarGroupLabel className="whitespace-nowrap">Subscriptions</SidebarGroupLabel>
                <SidebarMenu>
                    {data?.map((subscription) => (
                        <SidebarMenuItem key={subscription.id}>
                            <SidebarMenuButton
                                tooltip={subscription.name}
                                isActive={pathname === getFullChannelUrl(subscription.id)}
                                asChild
                            >
                                <Link href={getFullChannelUrl(subscription.id)} className="flex items-center gap-1">
                                    <Avatar className="size-5">
                                        <AvatarImage src={subscription.imageUrl} alt={subscription.name} />
                                    </Avatar>
                                    <span className="ml-2 line-clamp-1">{subscription.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    {data?.length === 0 && (
                        <SidebarMenuItem className="flex flex-col items-center gap-2 p-2">
                            <Smile className="text-muted-foreground size-8 rotate-180" />
                            <p className="text-muted-foreground text-center text-xs">You have no subscriptions</p>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function SubscriptionsListSkeleton() {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarGroupLabel className="whitespace-nowrap">Subscriptions</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem className="flex flex-col items-center gap-2 p-2">
                        <Loader2Icon className="size-3 animate-spin" />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function SubscriptionsListLoggedOut() {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarGroupLabel className="whitespace-nowrap">Subscriptions</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem className="flex flex-col items-center gap-2 p-2">
                        <div className="text-xs">Log in to subscribe, comment and like videos.</div>
                        <SignUpButton mode="modal">
                            <Button variant={"outline"} size={"sm"} className="text-xs">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

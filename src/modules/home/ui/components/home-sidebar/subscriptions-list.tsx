"use client";

import { Suspense } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
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
import { Loader2Icon } from "lucide-react";
import { getFullChannelUrl } from "@lib/utils";

export default function SubscriptionsList() {
    const { isSignedIn } = useAuth();
    const pathname = usePathname();

    return (
        <>
            <Separator />

            <Suspense fallback={<SubscriptionsListSkeleton />}>
                {isSignedIn && <SubscriptionsListSuspense pathname={pathname} />}
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
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function SubscriptionsListSkeleton() {
    return <Loader2Icon className="mx-auto mt-4 size-4 animate-spin" />;
}

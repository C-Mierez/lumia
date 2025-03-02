"use client";

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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function SubscriptionsList() {
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    const trpc = useTRPC();

    const { data } = useSuspenseQuery(trpc.subscriptions.getMany.queryOptions());

    if (!isSignedIn) return null;

    return (
        <>
            <Separator />

            <Suspense fallback={<p>Loading...</p>}>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarGroupLabel className="whitespace-nowrap">Subscriptions</SidebarGroupLabel>
                        <SidebarMenu>
                            {data?.map((subscription) => (
                                <SidebarMenuItem key={subscription.id}>
                                    <SidebarMenuButton
                                        tooltip={subscription.name}
                                        // TODO User profile url
                                        isActive={pathname === "item.href"}
                                        asChild
                                    >
                                        {/* // TODO User profile url */}
                                        <Link href={"item.href"} className="flex items-center gap-1">
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
            </Suspense>
        </>
    );
}

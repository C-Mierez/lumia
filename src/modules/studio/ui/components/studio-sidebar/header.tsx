"use client";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@components/ui/sidebar";
import { Skeleton } from "@components/ui/skeleton";

export default function StudioSidebarHeader() {
    const { user } = useUser();
    const sidebar = useSidebar();

    // Header Skeleton Fallback
    if (!user)
        return (
            <div className="flex w-full flex-col items-center gap-4 py-4">
                <Skeleton className="size-28 rounded-full" />
                <div className="flex flex-col items-center text-center text-balance">
                    <Skeleton className="w-16 text-base font-semibold">&nbsp;</Skeleton>
                    <Skeleton className="invisible w-8 text-sm">&nbsp;</Skeleton>
                </div>
            </div>
        );

    // Collapsed Header
    if (sidebar.state === "collapsed") {
        return (
            <SidebarMenu className="flex items-center justify-center py-2">
                <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center justify-center" tooltip={"Your Channel"} asChild>
                        <Link href={"/users/current"}>
                            <Avatar className="size-6">
                                <AvatarImage src={user?.imageUrl} />
                                <AvatarFallback>{user?.firstName}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Expanded Header
    return (
        <div className="flex w-full flex-col items-center gap-4 py-4">
            <Link href={"/users/current"}>
                <Avatar className="size-28">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName}</AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex flex-col items-center text-center text-balance">
                <h3 className="text-base font-semibold">Your Channel</h3>
                <p className="text-muted-foreground/50 text-sm">{user?.fullName ?? "User"}</p>
            </div>
        </div>
    );
}

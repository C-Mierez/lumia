"use client";
import Link from "next/link";

import { useTRPC } from "@/trpc/client";
import { useAuth, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@components/ui/sidebar";
import { Skeleton } from "@components/ui/skeleton";
import { getFullChannelUrl } from "@lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function StudioSidebarHeader() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const sidebar = useSidebar();

    // Header Skeleton Fallback
    if (!isLoaded || !isSignedIn || !user)
        return (
            <div className="flex w-full flex-col items-center gap-4 py-4">
                <Skeleton className="size-28 rounded-full" />
                <div className="flex flex-col items-center text-center text-balance">
                    <Skeleton className="w-16 text-base font-semibold">&nbsp;</Skeleton>
                    <Skeleton className="invisible w-8 text-sm">&nbsp;</Skeleton>
                </div>
            </div>
        );

    return (
        <StudioSidebarHeaderAuthed
            imageUrl={user.imageUrl}
            firstName={user.firstName}
            fullName={user.fullName}
            isCollapsed={sidebar.state === "collapsed"}
        />
    );
}

interface StudioSidebarHeaderAuthedProps {
    imageUrl: string;
    firstName: string | null;
    fullName: string | null;
    isCollapsed: boolean;
}

function StudioSidebarHeaderAuthed({ imageUrl, firstName, fullName, isCollapsed }: StudioSidebarHeaderAuthedProps) {
    const trpc = useTRPC();
    const { data: currentUser } = useSuspenseQuery(trpc.users.getCurrentUser.queryOptions());

    const profileHref = getFullChannelUrl(currentUser.id);

    // Collapsed Header
    if (isCollapsed) {
        return (
            <SidebarMenu className="flex items-center justify-center py-2">
                <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center justify-center" tooltip={"Your Channel"} asChild>
                        <Link href={profileHref}>
                            <Avatar className="size-6">
                                <AvatarImage src={imageUrl} />
                                <AvatarFallback>{firstName}</AvatarFallback>
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
            <Link href={profileHref}>
                <Avatar className="size-28">
                    <AvatarImage src={imageUrl} />
                    <AvatarFallback>{firstName}</AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex flex-col items-center text-center text-balance">
                <h3 className="text-foreground text-base font-semibold">Your Channel</h3>
                <p className="text-muted-foreground text-sm">{fullName ?? "User"}</p>
            </div>
        </div>
    );
}

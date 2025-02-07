"use client";

import { ClockIcon, FlameIcon, HistoryIcon, HomeIcon, ListVideoIcon, PlaySquareIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";

import { SidebarItem } from "../types";

const items: SidebarItem[] = [
    {
        title: "History",
        href: "/playlists/history",
        icon: HistoryIcon,
    },
    {
        title: "Liked Videos",
        href: "/playlists/liked",
        icon: ThumbsUpIcon,
    },
    {
        title: "Watch Later",
        href: "/playlists/watchLater",
        icon: ClockIcon,
    },
    {
        title: "Playlists",
        href: "/playlists",
        icon: ListVideoIcon,
    },
];

export default function PersonalSection() {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item, index) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={false} // TODO Make it look at current pathname
                                onClick={() => {}}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span className="ml-2">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

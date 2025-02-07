"use client";

import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
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
        title: "Home",
        href: "/",
        icon: HomeIcon,
    },
    {
        title: "Subscriptions",
        href: "/feed/subscriptions",
        icon: PlaySquareIcon,
    },
    {
        title: "Trending",
        href: "/feed/trending",
        icon: FlameIcon,
    },
];

export default function MainSection() {
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

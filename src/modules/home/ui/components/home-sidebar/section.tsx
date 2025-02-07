"use client";

import Link from "next/link";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";

import { useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";
import { SidebarItem } from "../types";

interface SectionProps {
    items: SidebarItem[];
}

export default function Section({ items }: SectionProps) {
    const clerk = useClerk();
    const { isSignedIn } = useAuth();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item, index) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={false} // TODO Make it look at current pathname
                                onClick={(e) => {
                                    if (!isSignedIn && item.needsAuth) {
                                        e.preventDefault();
                                        return clerk.openSignIn();
                                    }
                                }}
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

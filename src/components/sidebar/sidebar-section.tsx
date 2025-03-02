"use client";

import { useAuth } from "@clerk/clerk-react";
import { useClerk } from "@clerk/nextjs";
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "@components/ui/sidebar";

import SidebarItem from "./sidebar-item";
import { SidebarItemType } from "./types";

interface SidebarSectionProps {
    items: SidebarItemType[];
}

export default function SidebarSection({ items }: SidebarSectionProps) {
    const clerk = useClerk();
    const { isSignedIn } = useAuth();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarItem
                            item={item}
                            key={item.title}
                            onClick={(e) => {
                                if (!isSignedIn && item.needsAuth) {
                                    e.preventDefault();
                                    return clerk.openSignIn();
                                }
                            }}
                        />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

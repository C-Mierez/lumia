"use client";

import { useAuth } from "@clerk/clerk-react";
import { useClerk } from "@clerk/nextjs";
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "@components/ui/sidebar";

import { SidebarItem } from "../types";
import StudioSidebarItem from "./item";

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
                    {items.map((item) => (
                        <StudioSidebarItem
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

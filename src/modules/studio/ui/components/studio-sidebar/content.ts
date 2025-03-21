"use client";

import {
    ArrowLeftFromLineIcon,
    ChartColumnIcon,
    CircleDollarSignIcon,
    ClapperboardIcon,
    LayoutDashboardIcon,
    MessageSquareWarningIcon,
    Settings2Icon,
} from "lucide-react";

import { SidebarItem } from "../types";

export const mainItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/studio",
        icon: LayoutDashboardIcon,
        needsAuth: false,
    },
    {
        title: "Activity",
        href: "/studio/activity",
        icon: ChartColumnIcon,
        needsAuth: true,
    },
    // {
    //     title: "Analytics",
    //     href: "/studio/analytics",
    //     icon: ChartColumnIcon,
    //     needsAuth: true,
    // },
    // {
    //     title: "Earn",
    //     href: "/studio/earn",
    //     icon: CircleDollarSignIcon,
    //     needsAuth: true,
    // },
];

export const metaItems: SidebarItem[] = [
    {
        title: "Back to Home",
        href: "/",
        icon: ArrowLeftFromLineIcon,
        needsAuth: false,
    },
];

export const footerItems: SidebarItem[] = [
    {
        title: "Settings",
        href: "/settings",
        icon: Settings2Icon,
        needsAuth: true,
    },
    {
        title: "Send Feedback",
        href: "/feedback",
        icon: MessageSquareWarningIcon,
        needsAuth: true,
    },
];

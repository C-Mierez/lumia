"use client";

import { ClockIcon, FlameIcon, HistoryIcon, HomeIcon, ListVideoIcon, PlaySquareIcon, ThumbsUpIcon } from "lucide-react";

import { WATCH_LATER_URL_KEYWORD } from "@lib/constants";

import { SidebarItem } from "../types";

export const mainItems: SidebarItem[] = [
    {
        title: "Home",
        href: "/",
        icon: HomeIcon,
        needsAuth: false,
    },
    {
        title: "Subscriptions",
        href: "/feed/subscriptions",
        icon: PlaySquareIcon,
        needsAuth: true,
    },
    {
        title: "Trending",
        href: "/feed/trending",
        icon: FlameIcon,
        needsAuth: false,
    },
];

export const personalItems: SidebarItem[] = [
    {
        title: "History",
        href: "/playlists/history",
        icon: HistoryIcon,
        needsAuth: true,
    },
    {
        title: "Liked Videos",
        href: "/playlists/liked",
        icon: ThumbsUpIcon,
        needsAuth: true,
    },
    {
        title: "Watch Later",
        href: `/playlists/${WATCH_LATER_URL_KEYWORD}`,
        icon: ClockIcon,
        needsAuth: true,
    },
    {
        title: "Playlists",
        href: "/playlists",
        icon: ListVideoIcon,
        needsAuth: true,
    },
];

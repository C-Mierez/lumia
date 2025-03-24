"use client";

import { buildSearchQuery, SEARCH_KEY_VALUES } from "@lib/searchParams";
import { cn } from "@lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface ChannelNavigationProps {}

const Items = [
    {
        title: "Home",
        href: "/channel",
    },
    {
        title: "Videos",
        href: "/channel/videos",
    },
    {
        title: "Playlists",
        href: "/channel/playlists",
    },
    {
        title: "About",
        href: "/channel/about",
    },
];

export default function ChannelNavigation({}: ChannelNavigationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const userId = searchParams.get(SEARCH_KEY_VALUES.Home.u) || "";

    return (
        <nav className="border-border overflow-x-auto border border-t-0 border-r-0 border-l-0">
            <ul className="flex gap-2">
                {Items.map((item, index) => {
                    const url = `${item.href}${buildSearchQuery({ u: userId })}`;
                    const isActive = pathname === item.href;
                    return (
                        <li key={index} className="relative">
                            <Link href={url} className="text-body block size-full px-5 py-2 text-sm font-semibold">
                                {item.title}
                            </Link>
                            <div
                                className={cn(
                                    "bg-accent absolute bottom-0 left-0 h-0 w-full transition-[height]",
                                    isActive && "h-0.5",
                                )}
                            ></div>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

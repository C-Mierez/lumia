"use client";

import { buildSearchQuery, SEARCH_KEY_VALUES } from "@lib/searchParams";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const userId = searchParams.get(SEARCH_KEY_VALUES.Home.u) || "";

    return (
        <div className="border-border border border-t-0 border-r-0 border-l-0">
            <nav>
                <ul className="flex gap-2">
                    {Items.map((item, index) => {
                        const url = `${item.href}${buildSearchQuery({ u: userId })}`;

                        return (
                            <li key={index}>
                                <Link href={url} className="text-body block size-full px-5 py-2 text-sm font-semibold">
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

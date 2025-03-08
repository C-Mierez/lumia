import Link from "next/link";

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
    return (
        <div className="border-border border border-t-0 border-r-0 border-l-0">
            <nav>
                <ul className="flex gap-2">
                    {Items.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="text-body block size-full px-5 py-2 text-sm font-semibold"
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

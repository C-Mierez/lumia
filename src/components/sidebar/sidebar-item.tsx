import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuButton, SidebarMenuItem } from "@components/ui/sidebar";

import { SidebarItemType } from "./types";

interface SidebarItemProps {
    item: SidebarItemType;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function SidebarItem({ item, onClick }: SidebarItemProps) {
    const pathname = usePathname();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={item.title} isActive={pathname === item.href} onClick={onClick} asChild>
                <Link href={item.href}>
                    <item.icon />
                    <span className="ml-2">{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

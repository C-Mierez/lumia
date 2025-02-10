import Link from "next/link";

import { SidebarMenuButton, SidebarMenuItem } from "@components/ui/sidebar";

import { SidebarItem } from "../types";
import { usePathname } from "next/navigation";

interface StudioSidebarItemProps {
    item: SidebarItem;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function StudioSidebarItem({ item, onClick }: StudioSidebarItemProps) {
    const pathname = usePathname();

    return (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={item.title} isActive={pathname === item.href} onClick={onClick} asChild>
                <Link href={item.href}>
                    <item.icon />
                    <span className="ml-2">{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

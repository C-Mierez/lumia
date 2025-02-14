import { ForwardRefExoticComponent, RefAttributes } from "react";

import { LucideProps } from "lucide-react";

export type SidebarItemType = {
    title: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    href: string;
    needsAuth: boolean;
};

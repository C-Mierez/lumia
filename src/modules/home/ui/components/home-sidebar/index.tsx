import SidebarSection from "@components/sidebar/sidebar-section";
import { Separator } from "@components/ui/separator";
import { Sidebar, SidebarContent } from "@components/ui/sidebar";

import { mainItems, personalItems } from "./content";

export default function HomeSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarContent>
                <SidebarSection items={mainItems} />
                <Separator />
                <SidebarSection items={personalItems} />
                <Separator />
                {/* TODO Subscriptions section */}
            </SidebarContent>
        </Sidebar>
    );
}

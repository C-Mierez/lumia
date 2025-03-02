import SidebarSection from "@components/sidebar/sidebar-section";
import { Separator } from "@components/ui/separator";
import { Sidebar, SidebarContent } from "@components/ui/sidebar";

import { mainItems, personalItems } from "./content";
import SubscriptionsList from "./subscriptions-list";

export default function HomeSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarContent>
                <SidebarSection items={mainItems} label="Home" />
                <Separator />
                <SidebarSection items={personalItems} label="Your activity" />
                <SubscriptionsList />
            </SidebarContent>
        </Sidebar>
    );
}

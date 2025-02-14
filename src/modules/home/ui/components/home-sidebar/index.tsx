import { Separator } from "@components/ui/separator";
import { Sidebar, SidebarContent } from "@components/ui/sidebar";

import { mainItems, personalItems } from "./content";
import Section from "./section";

export default function HomeSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarContent>
                <Section items={mainItems} />
                <Separator />
                <Section items={personalItems} />
                <Separator />
                {/* TODO Subscriptions section */}
                <Section items={mainItems} />
            </SidebarContent>
        </Sidebar>
    );
}

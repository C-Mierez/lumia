import { Sidebar, SidebarContent } from "@components/ui/sidebar";
import { Separator } from "@components/ui/separator";
import Section from "./section";
import { mainItems, personalItems } from "./content";

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

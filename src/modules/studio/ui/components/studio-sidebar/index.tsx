import { Separator } from "@components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@components/ui/sidebar";

import { footerItems, mainItems, metaItems } from "./content";
import Section from "./section";
import StudioSidebarHeader from "./header";

export default function StudioSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarHeader className="p-0">
                <StudioSidebarHeader />
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <Section items={mainItems} />
                <Separator className="-my-2" />
                <Section items={metaItems} />
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-0">
                <Section items={footerItems} />
            </SidebarFooter>
        </Sidebar>
    );
}

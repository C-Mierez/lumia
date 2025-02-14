import SidebarSection from "@components/sidebar/sidebar-section";
import { Separator } from "@components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@components/ui/sidebar";

import { footerItems, mainItems, metaItems } from "./content";
import StudioSidebarHeader from "./header";

export default function StudioSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarHeader className="p-0">
                <StudioSidebarHeader />
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarSection items={mainItems} />
                <Separator className="-my-2" />
                <SidebarSection items={metaItems} />
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-0">
                <SidebarSection items={footerItems} />
            </SidebarFooter>
        </Sidebar>
    );
}

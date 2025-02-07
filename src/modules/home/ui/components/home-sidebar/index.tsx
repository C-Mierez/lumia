import { Sidebar, SidebarContent } from "@components/ui/sidebar";
import MainSection from "./main-section";
import PersonalSection from "./personal-section";
import { Separator } from "@components/ui/separator";

export default function HomeSidebar() {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            <SidebarContent>
                <MainSection />
                <Separator />
                <PersonalSection />
                <Separator />
                {/* TODO Subscriptions section */}
                <MainSection />
            </SidebarContent>
        </Sidebar>
    );
}

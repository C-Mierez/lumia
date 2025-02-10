import { SidebarProvider } from "@components/ui/sidebar";
import StudioNavbar from "@modules/studio/ui/components/studio-navbar";
import StudioSidebar from "@modules/studio/ui/components/studio-sidebar";

interface StudioLayoutProps {
    children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
    return (
        <SidebarProvider className="flex flex-col">
            <StudioNavbar />
            <div className="flex shrink-0">
                <StudioSidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </SidebarProvider>
    );
}

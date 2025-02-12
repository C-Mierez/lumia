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
                <main className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-6">{children}</main>
            </div>
        </SidebarProvider>
    );
}

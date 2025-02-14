import NavbarWrapper from "@components/navbar/navbar-wrapper";
import SidebarWrapper from "@components/sidebar/sidebar-wrapper";
import { SidebarProvider } from "@components/ui/sidebar";
import { cn } from "@lib/utils";

interface BaseLayoutProps {
    children: React.ReactNode;
    navbar: React.ReactNode;
    sidebar: React.ReactNode;
    className?: string;
}

export default function BaseLayout({ children, navbar, sidebar, className }: BaseLayoutProps) {
    return (
        <SidebarProvider className="flex flex-col">
            <NavbarWrapper>{navbar}</NavbarWrapper>
            <div className="flex shrink-0">
                <SidebarWrapper>{sidebar}</SidebarWrapper>
                <main className={cn("flex flex-1 flex-col overflow-y-auto", className)}>{children}</main>
            </div>
        </SidebarProvider>
    );
}

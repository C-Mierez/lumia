import { SidebarProvider } from "@components/ui/sidebar";
import HomeNavbar from "../components/home-navbar";
import HomeSidebar from "../components/home-sidebar";

interface HomeLayoutProps {
    children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <SidebarProvider className="flex flex-col">
            <HomeNavbar />
            <div className="flex shrink-0">
                <HomeSidebar />
                <main className="bg-brand-900 flex-1 overflow-y-auto">{children}</main>
            </div>
        </SidebarProvider>
    );
}

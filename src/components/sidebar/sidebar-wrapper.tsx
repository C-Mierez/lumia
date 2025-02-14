import { Sidebar } from "@components/ui/sidebar";

interface SidebarWrapperProps {
    children: React.ReactNode;
}

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
    return (
        <Sidebar className="pt-16" collapsible="icon">
            {children}
        </Sidebar>
    );
}

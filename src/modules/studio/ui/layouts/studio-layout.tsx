import BaseLayout from "@components/layout/base-layout";
import StudioNavbar from "@modules/studio/ui/components/studio-navbar";
import StudioSidebar from "@modules/studio/ui/components/studio-sidebar";

interface StudioLayoutProps {
    children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
    return (
        <BaseLayout navbar={<StudioNavbar />} sidebar={<StudioSidebar />} className="p-6">
            {children}
        </BaseLayout>
    );
}

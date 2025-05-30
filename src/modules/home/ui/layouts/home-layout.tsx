import BaseLayout from "@components/layout/base-layout";

import HomeNavbar from "../components/home-navbar";
import HomeSidebar from "../components/home-sidebar";

interface HomeLayoutProps {
    children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <BaseLayout navbar={<HomeNavbar />} sidebar={<HomeSidebar />}>
            {children}
        </BaseLayout>
    );
}

import { ChannelLayout } from "@modules/channels/ui/layouts/channel-layout";

interface LayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    tabs: React.ReactNode;
}

export default function Layout({ children, header, tabs }: LayoutProps) {
    return (
        <ChannelLayout header={header} tabs={tabs}>
            {children}
        </ChannelLayout>
    );
}

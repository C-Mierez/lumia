import ChannelNavigation from "../components/channel-navigation";

interface ChannelLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    tabs: React.ReactNode;
}

export function ChannelLayout({ children, header, tabs }: ChannelLayoutProps) {
    return (
        <div>
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 p-4">
                {header}
                <ChannelNavigation />
                {tabs}
            </div>
        </div>
    );
}

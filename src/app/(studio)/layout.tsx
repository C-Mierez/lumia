import StudioLayout from "@modules/studio/ui/layouts/studio-layout";

interface LayoutProps {
    children: React.ReactNode;
    video: React.ReactNode;
}

export default function Layout({ children, video }: LayoutProps) {
    return (
        <StudioLayout>
            {video}
            {children}
        </StudioLayout>
    );
}

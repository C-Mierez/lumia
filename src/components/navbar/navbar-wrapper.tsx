interface NavbarWrapperProps {
    children: React.ReactNode;
}

export default function NavbarWrapper({ children }: NavbarWrapperProps) {
    return (
        <nav className="bg-background sticky top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between gap-4 px-4 py-4">
            {children}
        </nav>
    );
}

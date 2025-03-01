interface NavbarWrapperProps {
    children: React.ReactNode;
}

export default function NavbarWrapper({ children }: NavbarWrapperProps) {
    return (
        <nav className="bg-background sticky top-0 right-0 left-0 z-50 grid h-16 w-full grid-cols-10 gap-4 px-4 py-4">
            {children}
        </nav>
    );
}

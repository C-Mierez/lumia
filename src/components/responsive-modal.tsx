import { useIsMobile } from "@hooks/use-mobile";
import { DialogTitle } from "@radix-ui/react-dialog";

import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

interface ResponsiveModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    title: string;
    onOpenChange: (isOpen: boolean) => void;
    className?: string;
    hideClose?: boolean;
}

export default function ResponsiveModal({
    children,
    isOpen,
    title,
    onOpenChange,
    className,
    hideClose,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile)
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent className={className}>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={className} hideClose={hideClose}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

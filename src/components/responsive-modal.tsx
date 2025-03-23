import { useIsMobile } from "@hooks/use-mobile";
import { ModalProps } from "@hooks/use-modal";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

interface ResponsiveModalProps extends ModalProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    className?: string;
    hideClose?: boolean;
    modal?: boolean;
}

export default function ResponsiveModal({
    children,
    header,
    className,
    hideClose = true,
    modal = true,
    isOpen,
    onOpenChange,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile)
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange} modal={modal}>
                <DrawerContent className={className}>
                    <DrawerHeader>
                        <DrawerTitle>{header}</DrawerTitle>
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} modal={modal}>
            <DialogContent className={className} hideClose={hideClose}>
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

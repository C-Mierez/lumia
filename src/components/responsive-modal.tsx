import { useIsMobile } from "@hooks/use-mobile";
import { DialogTitle } from "@radix-ui/react-dialog";

import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

interface ResponsiveModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    title: string;
    onOpenChange: (isOpen: boolean) => void;
}

export default function ResponsiveModal({ children, isOpen, title, onOpenChange }: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile)
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

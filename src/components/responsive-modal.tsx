import { DialogTitle } from "@radix-ui/react-dialog";

import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";

interface ResponsiveModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    header?: React.ReactNode;
    onOpenChange: (isOpen: boolean) => void;
    className?: string;
    hideClose?: boolean;
}

export default function ResponsiveModal({
    children,
    isOpen,
    header,
    onOpenChange,
    className,
    hideClose,
}: ResponsiveModalProps) {
    // const isMobile = useIsMobile();

    // if (isMobile)
    //     return (
    //         <Drawer open={isOpen} onOpenChange={onOpenChange} modal>
    //             <DrawerContent className={className}>
    //                 <DrawerHeader>
    //                     <DrawerTitle>{header}</DrawerTitle>
    //                 </DrawerHeader>
    //                 {children}
    //             </DrawerContent>
    //         </Drawer>
    //     );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
            <DialogContent className={className} hideClose={hideClose}>
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                </DialogHeader>

                {children}
            </DialogContent>
        </Dialog>
    );
}

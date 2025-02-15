"use client";

import { cn } from "../lib/utils";
import ResponsiveModal from "./responsive-modal";

interface SlotModalProps {
    isOpen?: boolean;
    onOpenChange: (isOpen: boolean) => void;
    className?: string;
    children: React.ReactNode;
}

export default function SlotModal({ children, onOpenChange, isOpen = true, className }: SlotModalProps) {
    return (
        <ResponsiveModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            hideClose
            className={cn("max-h-screen w-full overflow-y-auto sm:max-w-7xl", "focus:outline-0", className)}
        >
            {children}
        </ResponsiveModal>
    );
}

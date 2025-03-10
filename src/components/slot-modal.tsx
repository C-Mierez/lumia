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
            className={cn("w-full sm:max-w-7xl", "focus:outline-0", className)}
        >
            <div className="max-h-screen overflow-y-auto">{children}</div>
        </ResponsiveModal>
    );
}

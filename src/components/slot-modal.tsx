"use client";

import { ModalProps } from "@hooks/use-modal";

import { cn } from "../lib/utils";
import ResponsiveModal from "./responsive-modal";

interface SlotModalProps extends ModalProps {
    className?: string;
    children: React.ReactNode;
}

export default function SlotModal(props: SlotModalProps) {
    const { children, className } = props;

    return (
        <ResponsiveModal {...props} hideClose className={cn("w-full sm:max-w-7xl", "focus:outline-0", className)}>
            <div className="max-h-screen overflow-y-auto">{children}</div>
        </ResponsiveModal>
    );
}

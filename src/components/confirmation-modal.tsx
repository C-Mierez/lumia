"use client";

import ResponsiveModal from "./responsive-modal";
import { Button } from "./ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
    description: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({
    isOpen,
    onOpenChange,
    title,
    description,
    destructive = false,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    const onChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            onCancel();
        }
    };

    return (
        <ResponsiveModal isOpen={isOpen} onOpenChange={onChange} hideClose className="m-0 p-0">
            <div className="flex flex-col gap-4 p-4">
                {title && (
                    <div className="text-start text-balance">
                        <h2 className="flex justify-between text-xl font-bold">{title}</h2>
                    </div>
                )}
                <p className="text-muted-foreground text-sm">{description}</p>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant={destructive ? "destructive" : "secondary"}
                        onClick={() => {
                            onOpenChange(false);
                            onConfirm();
                        }}
                    >
                        Confirm
                    </Button>
                    <Button
                        type="button"
                        variant={"muted"}
                        onClick={() => {
                            onOpenChange(false);
                            onCancel();
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}

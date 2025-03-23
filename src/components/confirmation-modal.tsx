"use client";

import { ModalProps } from "@hooks/use-modal";

import ResponsiveModal from "./responsive-modal";
import { Button } from "./ui/button";

interface ConfirmationModalProps extends ModalProps {
    title?: string;
    description: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    const { onOpenChange, title, description, destructive = false, onConfirm, onCancel } = props;

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            onCancel?.();
        }
        onOpenChange(isOpen);
    };

    return (
        <ResponsiveModal {...props} onOpenChange={handleOpenChange} hideClose className="m-0 p-0">
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
                            onConfirm();
                            handleOpenChange(false);
                        }}
                    >
                        Confirm
                    </Button>
                    <Button
                        type="button"
                        variant={"muted"}
                        onClick={() => {
                            handleOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}

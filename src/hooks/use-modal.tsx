import { useState } from "react";

interface UseModalProps {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onClose?: () => void;
    onOpen?: () => void;
}

export default function useModal({
    isOpen: isModalOpen = false,
    onOpenChange,
    onClose,
    onOpen,
}: UseModalProps): ModalProps {
    const [isOpen, setIsOpen] = useState(isModalOpen);

    const handleOnChange = (isOpen: boolean) => {
        setIsOpen(isOpen);
        if (isOpen) {
            onOpen?.();
        } else {
            onClose?.();
        }
        onOpenChange?.(isOpen);
    };

    const openModal = () => {
        handleOnChange(true);
    };
    const closeModal = () => {
        handleOnChange(false);
    };

    return {
        isOpen,
        onOpenChange: handleOnChange,
        openModal,
        closeModal,
    };
}

export interface ModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    openModal: () => void;
    closeModal: () => void;
}

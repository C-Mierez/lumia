import { useState } from "react";

interface UseModalProps {
    isModalOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function useModal({ isModalOpen = false, onOpenChange }: UseModalProps): ModalProps {
    const [isOpen, setIsOpen] = useState(isModalOpen);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return {
        isOpen,
        onOpenChange: onOpenChange ?? setIsOpen,
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

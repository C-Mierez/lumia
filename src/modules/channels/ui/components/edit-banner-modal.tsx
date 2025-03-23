"use client";

import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import ConfirmationModal from "@components/confirmation-modal";
import ResponsiveModal from "@components/responsive-modal";
import { Button } from "@components/ui/button";
import useModal, { ModalProps } from "@hooks/use-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import BannerUploader from "./banner-uploader";

interface EditBannerModalProps extends ModalProps {
    userId: string;
}

export default function EditBannerModal(props: EditBannerModalProps) {
    const { onOpenChange, userId } = props;

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const removeModal = useModal({});

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            removeModal.closeModal();
        }
        onOpenChange(isOpen);
    };

    const removeBanner = useMutation(
        trpc.users.removeBanner.mutationOptions({
            onMutate() {
                toast.info("Removing banner...");
            },
            async onSuccess() {
                toast.success("Banner removed successfully");
                await queryClient.invalidateQueries({ queryKey: trpc.channels.getOne.queryKey({ userId }) });
            },
            onError(error) {
                toast.error(`An error occurred: ${error.message}`);
            },
        }),
    );

    return (
        <ResponsiveModal {...props} onOpenChange={handleOpenChange} hideClose className="m-0 p-0">
            <>
                <ConfirmationModal
                    {...removeModal}
                    title={"Remove banner"}
                    description={"Are you sure you want to remove your channel banner?"}
                    onConfirm={() => {
                        removeBanner.mutate();
                    }}
                    destructive
                />
                <div className="flex flex-col gap-4 p-4">
                    <h1>Edit your channel banner</h1>
                    <BannerUploader userId={userId} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant={"destructive"} onClick={removeModal.openModal}>
                            Remove
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
            </>
        </ResponsiveModal>
    );
}

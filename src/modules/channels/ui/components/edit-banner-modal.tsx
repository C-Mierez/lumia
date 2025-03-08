"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { SubscriptionsGetSubscribersOutput, SubscriptionsGetSubscribersQuery } from "@/trpc/types";
import InfiniteScroll from "@components/infinite-scroll";
import ResponsiveModal from "@components/responsive-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import useModal, { ModalProps } from "@hooks/use-modal";
import { getFullChannelUrl } from "@lib/utils";
import BannerUploader from "./banner-uploader";
import ConfirmationModal from "@components/confirmation-modal";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditBannerModalProps extends ModalProps {
    userId: string;
}

export default function EditBannerModal({
    isOpen = false,
    onOpenChange,
    openModal,
    closeModal,
    userId,
}: EditBannerModalProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const removeModal = useModal({});

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
        <ResponsiveModal isOpen={isOpen} onOpenChange={onOpenChange} hideClose className="m-0 p-0">
            <>
                <ConfirmationModal
                    isOpen={removeModal.isOpen}
                    onOpenChange={removeModal.onOpenChange}
                    title={"Remove banner"}
                    description={"Are you sure you want to remove your channel banner?"}
                    destructive
                    onConfirm={() => {
                        removeBanner.mutate();
                        removeModal.closeModal();
                    }}
                    onCancel={removeModal.closeModal}
                />
                <div className="flex flex-col gap-4 p-4">
                    <h1>Edit your channel banner</h1>
                    <BannerUploader userId={userId} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant={"destructive"} onClick={removeModal.openModal}>
                            Remove
                        </Button>
                        <Button type="button" variant={"muted"} onClick={closeModal}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </>
        </ResponsiveModal>
    );
}

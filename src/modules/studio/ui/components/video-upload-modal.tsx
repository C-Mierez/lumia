"use client";
import { CirclePlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@components/ui/button";
import ResponsiveModal from "@components/responsive-modal";
import VideoUploader from "./video-uploader";

export default function VideoUploadModal() {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video created");
            utils.studio.getMany.invalidate();
        },
        onError: (error) => {
            toast.error(`An error occurred: ${error.message}`);
        },
    });

    return (
        <>
            <ResponsiveModal
                isOpen={!!create.data}
                title={"Create video"}
                onOpenChange={() => {
                    create.reset();
                }}
            >
                {!!create.data?.url ? (
                    <VideoUploader endpoint={create.data?.url} onSuccess={() => {}} />
                ) : (
                    <Loader2Icon className="animate-spin" />
                )}
            </ResponsiveModal>
            <Button
                variant={"muted"}
                className="[&_svg]:size-4"
                onClick={() => {
                    create.mutate();
                }}
                disabled={create.isPending}
            >
                <CirclePlusIcon />
                Create
            </Button>
        </>
    );
}

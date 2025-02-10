"use client";
import { CirclePlusIcon } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@components/ui/button";

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
    );
}

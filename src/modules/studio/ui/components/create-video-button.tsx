"use client";
import { CirclePlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@components/ui/button";

export default function CreateVideoButton() {
    const [_, setEditVideo] = useQueryState("edit");
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onMutate: async () => {
            toast.info("Creating new video...");
        },
        onSuccess: (video) => {
            toast.success("New video created");
            utils.studio.getMany.invalidate();
            setEditVideo(video.id);
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

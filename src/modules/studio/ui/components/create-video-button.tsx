"use client";
import { CirclePlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@components/ui/button";

export default function CreateVideoButton() {
    const utils = trpc.useUtils();
    const router = useRouter();

    const create = trpc.videos.create.useMutation({
        onMutate: async () => {
            toast.info("Creating new video...");
        },
        onSuccess: (video) => {
            toast.success("New video created");
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: video.id });
            router.push(`/studio/video/${video.id}`);
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

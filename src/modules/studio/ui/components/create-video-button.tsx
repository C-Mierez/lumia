"use client";
import { CirclePlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreateVideoButton() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();

    const create = useMutation(
        trpc.videos.create.mutationOptions({
            onMutate: async () => {
                toast.info("Creating new video...");
            },
            onSuccess: async (video) => {
                toast.success("New video created");
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getMany.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getOne.queryKey({ id: video.id }) });
                router.push(`/studio/video/${video.id}`);
            },
            onError: (error) => {
                toast.error(`An error occurred: ${error.message}`);
            },
        }),
    );

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

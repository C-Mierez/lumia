import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import BasicTooltip from "@components/basic-tooltip";
import { Button } from "@components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RestoreThumbnailButtonProps {
    video: StudioGetOneOutput;
}

export function RestoreThumbnailButton({ video }: RestoreThumbnailButtonProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const restoreThumbnail = useMutation(
        trpc.videos.restoreThumbnail.mutationOptions({
            onMutate: () => {
                toast.info("Restoring thumbnail...");
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getOne.queryKey({ id: video.id }) });
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getMany.queryKey() });
                toast.success("Thumbnail restored successfully");
            },
            onError: (error) => {
                toast.error(`Failed to restore thumbnail: ${error.message}`);
            },
        }),
    );

    const disabled = restoreThumbnail.isPending;

    return (
        <BasicTooltip label="Restore thumbnail to auto-generated one">
            <Button
                type="button"
                variant={"muted"}
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        restoreThumbnail.mutate({ id: video.id });
                    }
                }}
            >
                {!!disabled ? <Loader2Icon className="animate-spin" /> : <RotateCcwIcon />}
                {/* Restore */}
            </Button>
        </BasicTooltip>
    );
}

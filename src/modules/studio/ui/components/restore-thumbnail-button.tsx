import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import BasicTooltip from "@components/basic-tooltip";
import { Button } from "@components/ui/button";

interface RestoreThumbnailButtonProps {
    video: StudioGetOneOutput;
}

export function RestoreThumbnailButton({ video }: RestoreThumbnailButtonProps) {
    const utils = trpc.useUtils();

    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onMutate: () => {
            toast.info("Restoring thumbnail...");
        },
        onSuccess: async () => {
            utils.studio.getMany.invalidate();
            await utils.studio.getOne.invalidate({ id: video?.id });
            toast.success("Thumbnail restored successfully");
        },
        onError: (error) => {
            toast.error(`Failed to restore thumbnail: ${error.message}`);
        },
    });

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

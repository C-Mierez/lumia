"use client";

import { useState } from "react";

import { BanIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import PromptModal from "@components/prompt-modal";
import { VideoStatus } from "@modules/videos/server/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";

import { canGenerateAIContent, isDisablingStatus } from "../utils";

interface ThumbnailGeneratorProps {
    video: StudioGetOneOutput;
    disabled?: boolean;
}

export default function ThumbnailGenerator({ video, disabled }: ThumbnailGeneratorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const generateThumbnail = useMutation(
        trpc.videos.generateThumbnail.mutationOptions({
            onSuccess: () => {
                toast.success("Thumbnail generation started", {
                    description: "This may take a few minutes to complete",
                    duration: 20000,
                });
            },
            onError: (error) => {
                toast.error(`Failed to generate thumbnail: ${error.message}`);
            },
        }),
    );

    const onThumbnailStatus = useSubscription(
        trpc.videos.onGenerateThumbnail.subscriptionOptions(
            { videoId: video.id },
            {
                async onData(data) {
                    if (data.status === VideoStatus.Finished) {
                        await queryClient.invalidateQueries({ queryKey: trpc.studio.getMany.queryKey() });
                        await queryClient.invalidateQueries({
                            queryKey: trpc.studio.getOne.queryKey({ id: video.id }),
                        });
                    }
                },
            },
        ),
    );

    const thumbnailStatus = onThumbnailStatus.data?.status ?? null;

    const canGenerate = canGenerateAIContent(video);

    const isDisabled = disabled || generateThumbnail.isPending || isDisablingStatus(thumbnailStatus) || !canGenerate;

    return (
        <>
            <PromptModal
                isOpen={isModalOpen}
                title="Generate Thumbnail"
                message="Provide a descriptive prompt for the AI to generate a thumbnail"
                placeholder="Leave empty to let the AI surprise you"
                onConfirm={(prompt) => {
                    setIsModalOpen(false);
                    generateThumbnail.mutate({ videoId: video.id, prompt });
                }}
                onCancel={() => setIsModalOpen(false)}
            />
            <button
                type="button"
                className="bg-background-alt border-muted-foreground/50 group-hover:bg-muted flex size-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed disabled:cursor-default disabled:opacity-50"
                disabled={isDisabled}
                onClick={() => setIsModalOpen(true)}
            >
                {isDisabled ? (
                    canGenerate ? (
                        <Loader2Icon className="animate-spin" />
                    ) : (
                        <BanIcon />
                    )
                ) : (
                    <SparklesIcon className="transition-transform group-hover:scale-110" />
                )}
                <p className="text-muted-foreground group-hover:group-[not-disabled]:text-foreground mt-2 h-6 text-center text-sm text-balance group-hover:group-[not-disabled]:underline">
                    {isDisabled
                        ? canGenerate
                            ? (thumbnailStatus ?? "Fetching status")
                            : "Processed video needed"
                        : "Generate using AI"}
                </p>
                {isDisabled ? null : (
                    <p className="text-muted-foreground/25 -mt-1 h-1 text-xs group-hover:decoration-0">
                        Limits my apply
                    </p>
                )}
            </button>
        </>
    );
}

import { useEffect, useState } from "react";

import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Textarea } from "@components/ui/textarea";
import { VideoStatus } from "@modules/videos/server/constants";

import { canGenerateAIContent, isDisablingStatus } from "../../utils";
import { GenWithAIButton } from "../gen-with-ai";
import { VideoUpdateSchema } from "./video-update-form";

interface DescriptionFieldProps {
    form: UseFormReturn<VideoUpdateSchema>;
    video: StudioGetOneOutput;
}

export function DescriptionField({ form, video }: DescriptionFieldProps) {
    const [isDisabled, setIsDisabled] = useState(false);

    return (
        <FormField
            name="description"
            control={form.control}
            render={({ field }) => {
                field.disabled = isDisabled;
                return (
                    <FormItem>
                        <div className="flex items-end justify-between gap-2">
                            <FormLabel className="text-muted-foreground font-normal">Description</FormLabel>
                            <GenWithAIWrapper video={video} onDisabled={setIsDisabled} />
                        </div>
                        <FormControl>
                            <Textarea
                                {...field}
                                value={field.value ?? undefined}
                                placeholder="Describe the content of your video"
                                className="resize-none text-sm"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}

function GenWithAIWrapper(props: { video: StudioGetOneOutput; onDisabled: (disabled: boolean) => void }) {
    const utils = trpc.useUtils();

    const generateDescription = trpc.videos.generateDescription.useMutation({
        onSuccess: () => {
            toast.success("Description generation started", {
                description: "This may take a few minutes to complete",
                duration: 20000,
            });
        },
        onError: (error) => {
            toast.error(`Failed to generate description: ${error.message}`);
        },
    });

    const onDescriptionStatus = trpc.videos.onGenerateDescription.useSubscription(
        { videoId: props.video.id },
        {
            async onData(data) {
                if (data.status === VideoStatus.Finished) {
                    utils.studio.getMany.invalidate();
                    await utils.studio.getOne.invalidate({ id: props.video.id });
                }
            },
        },
    );

    const isGenerationDisabled =
        generateDescription.isPending ||
        onDescriptionStatus.status === "connecting" ||
        isDisablingStatus(onDescriptionStatus.data?.status ?? null) ||
        !canGenerateAIContent(props.video);

    useEffect(() => {
        if (canGenerateAIContent(props.video)) props.onDisabled(isGenerationDisabled);
    }, [isGenerationDisabled]);

    return (
        <GenWithAIButton
            disabled={isGenerationDisabled}
            status={onDescriptionStatus.data?.status ?? ""}
            tooltip="Generate description using AI"
            onClick={() => {
                generateDescription.mutate({ videoId: props.video.id });
            }}
        />
    );
}

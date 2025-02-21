import { useEffect, useState } from "react";

import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { VideoStatus } from "@modules/videos/server/constants";

import { canGenerateAIContent, isDisablingStatus } from "../../utils";
import { GenWithAIButton } from "../gen-with-ai";
import { VideoUpdateSchema } from "./video-update-form";

interface TitleFieldProps {
    form: UseFormReturn<VideoUpdateSchema>;
    video: StudioGetOneOutput;
}

export function TitleField({ form, video }: TitleFieldProps) {
    const [isDisabled, setIsDisabled] = useState(false);

    return (
        <FormField
            name="title"
            control={form.control}
            render={({ field }) => {
                field.disabled = isDisabled;
                return (
                    <FormItem>
                        <div className="flex items-end justify-between gap-2">
                            <FormLabel className="text-muted-foreground font-normal">Title</FormLabel>
                            <GenWithAIWrapper video={video} onDisabled={setIsDisabled} />
                        </div>
                        <FormControl>
                            <Input {...field} placeholder="Add a title to your video" />
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

    const generateTitle = trpc.videos.generateTitle.useMutation({
        onSuccess: () => {
            toast.success("Title generation started", {
                description: "This may take a few minutes to complete",
                duration: 20000,
            });
        },
        onError: (error) => {
            toast.error(`Failed to generate title: ${error.message}`);
        },
    });

    const onTitleStatus = trpc.videos.onGenerateTitle.useSubscription(
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
        generateTitle.isPending ||
        onTitleStatus.status === "connecting" ||
        isDisablingStatus(onTitleStatus.data?.status ?? null) ||
        !canGenerateAIContent(props.video);

    useEffect(() => {
        if (canGenerateAIContent(props.video)) props.onDisabled(isGenerationDisabled);
    }, [isGenerationDisabled]);

    return (
        <GenWithAIButton
            disabled={isGenerationDisabled}
            status={onTitleStatus.data?.status ?? ""}
            tooltip="Generate title using AI"
            onClick={() => {
                generateTitle.mutate({ videoId: props.video.id });
            }}
        />
    );
}

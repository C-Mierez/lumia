import { useEffect, useState } from "react";

import { Loader2Icon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { videoUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { StudioGetOneOutput, StudioGetOneQuery } from "@/trpc/types";
import ConfirmationModal from "@components/confirmation-modal";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import { Separator } from "@components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import useModal from "@hooks/use-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RestoreThumbnailButton } from "../restore-thumbnail-button";
import { CategoryField } from "./category-field";
import { DescriptionField } from "./description-field";
import { ThumbnailField } from "./thumbnail-field";
import { TitleField } from "./title-field";
import VideoIsland from "./video-island";
import { VisibilityField } from "./visibility-field";

function useVideoUpdateTRPC(
    video: StudioGetOneOutput,
    resetForm: (video: StudioGetOneOutput) => void,
    closeModal: () => void,
) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const updateVideo = useMutation(
        trpc.videos.update.mutationOptions({
            onMutate: () => {
                toast.info("Updating video...");
            },
            onSuccess: async (data) => {
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getMany.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getOne.queryKey({ id: video.id }) });
                await queryClient.invalidateQueries({ queryKey: trpc.watch.getOne.queryKey({ videoId: video.id }) });
                toast.success("Video updated successfully");
                resetForm(data);
            },
            onError: () => {
                toast.error("Failed to update video");
            },
        }),
    );

    const deleteVideo = useMutation(
        trpc.videos.delete.mutationOptions({
            onMutate: () => {
                toast.info("Deleting video...");
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getMany.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.studio.getOne.queryKey({ id: video.id }) });
                toast.success("Video deleted successfully");
                closeModal();
            },
            onError: () => {
                toast.error("Failed to delete video");
            },
        }),
    );

    return {
        updateVideo,
        deleteVideo,
    };
}

interface VideoUpdateFormProps {
    video: StudioGetOneOutput;
    videoQuery: StudioGetOneQuery;
    closeModal: () => void;
}

export type VideoUpdateSchema = z.infer<typeof videoUpdateSchema>;

export default function VideoUpdateForm({ video, videoQuery, closeModal }: VideoUpdateFormProps) {
    /* ---------------------------------- State --------------------------------- */
    const [isFormDisabled, setIsFormDisabled] = useState<true | undefined>(undefined);

    /* ---------------------------------- tRPC ---------------------------------- */
    const { updateVideo, deleteVideo } = useVideoUpdateTRPC(video, resetForm, closeModal);

    /* ----------------------------- React Hook Form ---------------------------- */
    const form = useForm<VideoUpdateSchema>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
        disabled: isFormDisabled,
        mode: "onChange",
    });

    // Set listener for external video title and description changes (AI Generation sub-components)
    useEffect(() => {
        // Reset form when video changes
        if (video) {
            form.reset(video, {
                keepDirtyValues: true,
            });
        }
    }, [video, form]);
    useEffect(() => {
        console.log("Title changed");
        form.resetField("title", {
            defaultValue: video.title,
        });
    }, [form, video.title]);
    useEffect(() => {
        console.log("Description changed");
        form.resetField("description", {
            defaultValue: video.description,
        });
    }, [form, video.description]);

    const { isDirty, isValid, isSubmitted } = form.formState;

    const canSubmit = isDirty && isValid && !isSubmitted;
    const canRefresh = !videoQuery.isFetching && !updateVideo.isPending;

    const onSubmit = (data: VideoUpdateSchema) => {
        if (!canSubmit) return;
        updateVideo.mutate(data);
    };

    function resetForm(video: StudioGetOneOutput) {
        form.reset(video);
    }

    const onDelete = () => {
        setIsFormDisabled(true);
        deleteVideo.mutate({ id: video.id });
    };

    /* --------------------------------- Actions -------------------------------- */

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* Header */}
                <VideoUpdateFormHeader
                    closeModal={closeModal}
                    canRefresh={canRefresh}
                    canSubmit={canSubmit}
                    onDelete={onDelete}
                    video={video}
                />

                <Separator />

                {/* Form fields */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                    {/* Details Section */}
                    <div className="order-2 flex flex-col gap-4 md:order-1 xl:col-span-3">
                        <FormSectionHeader
                            title="General"
                            description=" Fill in the fields with the information of your video"
                        />

                        <TitleField form={form} video={video} />

                        <DescriptionField form={form} video={video} />

                        <CategoryField form={form} />

                        <Separator />

                        <FormSectionHeader
                            title="Visibility"
                            description="Decide on the visibility restrictions for your video"
                        />

                        <VisibilityField form={form} video={video} />

                        <Separator />

                        <FormSectionHeader
                            title="Thumbnail"
                            description="Set a thumbnail that stands out to draw your viewer's attention"
                            aside={<RestoreThumbnailButton video={video} />}
                        />

                        <ThumbnailField form={form} video={video} />
                    </div>
                    <div className="order-1 flex flex-col gap-4 md:order-2 xl:col-span-2">
                        <VideoIsland video={video} />
                    </div>
                </div>
            </form>
        </Form>
    );
}

function FormSectionHeader({
    title,
    description,
    aside,
}: {
    title?: string;
    description?: string;
    aside?: React.ReactNode;
}) {
    return (
        <div className="flex items-end justify-between gap-2">
            <div>
                {!!title && <h2 className="text-xl">{title}</h2>}
                {!!description && <p className="text-muted-foreground-alt text-xs">{description}</p>}
            </div>
            <div>{aside}</div>
        </div>
    );
}

interface VideoUpdateFormHeaderProps {
    closeModal: () => void;
    canRefresh: boolean;
    canSubmit: boolean;
    onDelete: () => void;
    video: StudioGetOneOutput;
}

function VideoUpdateFormHeader({ closeModal, canRefresh, canSubmit, onDelete, video }: VideoUpdateFormHeaderProps) {
    const shownVideoTitle = !!video.title ? video.title : "Untitled Video";
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const deleteModal = useModal({});

    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            {/* Video title */}
            <h1 className="font-brand text-xl font-bold md:text-2xl">{shownVideoTitle}</h1>

            {/* Actions */}
            <div className="flex flex-row-reverse justify-end gap-2 md:flex-row md:justify-start">
                <Button
                    type="button"
                    variant={"ghost"}
                    disabled={!canRefresh}
                    onClick={
                        canRefresh
                            ? async () => {
                                  await queryClient.invalidateQueries({
                                      queryKey: trpc.studio.getOne.queryKey({ id: video.id }),
                                  });
                              }
                            : undefined
                    }
                    className="group"
                >
                    {!canRefresh ? (
                        <Loader2Icon className="animate-spin" />
                    ) : (
                        <RefreshCwIcon className="transition-transform group-hover:rotate-90" />
                    )}
                </Button>

                <Button type="submit" variant={"secondary"} disabled={!canSubmit}>
                    Save
                </Button>

                <Button
                    type="button"
                    variant={"muted"}
                    onClick={() => {
                        closeModal();
                    }}
                >
                    Cancel
                </Button>

                <ConfirmationModal
                    {...deleteModal}
                    title={`Delete "${shownVideoTitle}"`}
                    description={"Are you sure you want to delete this video?"}
                    onConfirm={onDelete}
                    destructive
                />
                <Button type="button" variant={"destructiveMuted"} onClick={deleteModal.openModal}>
                    <Trash2Icon />
                </Button>
            </div>
        </div>
    );
}

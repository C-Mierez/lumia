import { useEffect, useState } from "react";

import { Loader2Icon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { StudioGetOneOutput, StudioGetOneQuery } from "@/trpc/types";
import ConfirmationModal from "@components/confirmation-modal";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import { Separator } from "@components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";

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
    onOpenChange: (isOpen: boolean) => void,
) {
    const utils = trpc.useUtils();

    const updateVideo = trpc.videos.update.useMutation({
        onMutate: () => {
            toast.info("Updating video...");
        },
        onSuccess: (data) => {
            utils.studio.getOne.invalidate({ id: video.id });
            utils.studio.getMany.invalidate();
            toast.success("Video updated successfully");
            resetForm(data);
        },
        onError: () => {
            toast.error("Failed to update video");
        },
    });

    const deleteVideo = trpc.videos.delete.useMutation({
        onMutate: () => {
            toast.info("Deleting video...");
        },
        onSuccess: () => {
            Promise.all([
                utils.studio.getMany.invalidate(),
                utils.studio.getOne.invalidate({ id: video?.id }, { refetchType: "none" }),
            ]);
            toast.success("Video deleted successfully");
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Failed to delete video");
        },
    });

    return {
        utils,
        updateVideo,
        deleteVideo,
    };
}

function useOnFieldChange() {}

interface VideoUpdateFormProps {
    video: StudioGetOneOutput;
    videoQuery: StudioGetOneQuery;
    onOpenChange: (isOpen: boolean) => void;
}

export type VideoUpdateSchema = z.infer<typeof videoUpdateSchema>;

export default function VideoUpdateForm({ video, videoQuery, onOpenChange }: VideoUpdateFormProps) {
    /* ---------------------------------- State --------------------------------- */
    const [isFormDisabled, setIsFormDisabled] = useState<true | undefined>(undefined);

    /* ---------------------------------- tRPC ---------------------------------- */
    const { utils, updateVideo, deleteVideo } = useVideoUpdateTRPC(video, resetForm, onOpenChange);

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
                    onOpenChange={onOpenChange}
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
    onOpenChange: (isOpen: boolean) => void;
    canRefresh: boolean;
    canSubmit: boolean;
    onDelete: () => void;
    video: StudioGetOneOutput;
}

function VideoUpdateFormHeader({ onOpenChange, canRefresh, canSubmit, onDelete, video }: VideoUpdateFormHeaderProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const shownVideoTitle = !!video.title ? video.title : "Untitled Video";
    const utils = trpc.useUtils();
    return (
        <div className="flex items-end justify-between">
            {/* Video title */}
            <h1 className="font-brand text-2xl font-bold">{shownVideoTitle}</h1>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={"ghost"}
                    disabled={!canRefresh}
                    onClick={
                        canRefresh
                            ? () => {
                                  utils.studio.getOne.invalidate({ id: video.id });
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
                        onOpenChange(false);
                    }}
                >
                    Cancel
                </Button>

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onOpenChange={(isOpen) => {
                        setShowDeleteModal(isOpen);
                    }}
                    title={`Delete "${shownVideoTitle}"`}
                    description={"Are you sure you want to delete this video?"}
                    onConfirm={onDelete}
                    onCancel={() => {}}
                    destructive
                />
                <Button type="button" variant={"destructiveMuted"} onClick={() => setShowDeleteModal(true)}>
                    <Trash2Icon />
                </Button>
            </div>
        </div>
    );
}

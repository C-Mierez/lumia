"use client";

import { useEffect, useState } from "react";

import {
    Check,
    ChevronsUpDown,
    Loader2Icon,
    MoreVerticalIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SparklesIcon,
    Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { StudioGetOneOutput, StudioGetOneQuery } from "@/trpc/types";
import CopyToClipboardButton from "@components/copy-to-clipboard-button";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Textarea } from "@components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, formatUppercaseFirstLetter, getDefaultMuxThumbnailUrl, getFullVideoUrl } from "@lib/utils";
import { VideoStatus } from "@modules/videos/server/constants";
import VideoPlayer from "@modules/videos/ui/components/video-player";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";
import { skipToken } from "@tanstack/react-query";

import ThumbnailGenerator from "./thumbnail-generator";
import ThumbnailUploader from "./thumbnail-uploader";
import VideoUploader from "./video-uploader";

interface VideoEditFormProps {
    video: StudioGetOneOutput;
    videoQuery: StudioGetOneQuery;
    onOpenChange: (isOpen: boolean) => void;
}

export default function VideoEditForm({ video, onOpenChange, videoQuery }: VideoEditFormProps) {
    /* -------------------------------------------------------------------------- */
    /*                                    TRPC                                    */
    /* -------------------------------------------------------------------------- */
    const utils = trpc.useUtils();
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const updateVideo = trpc.videos.update.useMutation({
        onMutate: () => {
            toast.info("Updating video...");
        },
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: video?.id });
            toast.success("Video updated successfully");
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
            utils.studio.getMany.invalidate();
            toast.success("Video deleted successfully");
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Failed to delete video");
        },
    });

    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onMutate: () => {
            toast.info("Restoring thumbnail...");
        },
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: video?.id });
            toast.success("Thumbnail restored successfully");
        },
        onError: (error) => {
            toast.error(`Failed to restore thumbnail: ${error.message}`);
        },
    });

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
    const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
        onSuccess: () => {
            toast.success("Thumbnail generation started", {
                description: "This may take a few minutes to complete",
                duration: 20000,
            });
        },
        onError: (error) => {
            toast.error(`Failed to generate thumbnail: ${error.message}`);
        },
    });

    const [titleStatus, setTitleStatus] = useState("");
    const onTitleStatus = trpc.videos.onGenerateTitle.useSubscription(
        generateTitle.data ? { videoId: video.id } : skipToken,
        {
            onData(data) {
                if (data && data.status) setTitleStatus(data.status);
                if (data.status === VideoStatus.Finished) {
                    setTitleStatus("");
                    utils.studio.getOne.invalidate({ id: video.id });
                    utils.studio.getMany.invalidate();
                }
            },
        },
    );

    const [descriptionStatus, setDescriptionStatus] = useState("");
    const onDescriptionStatus = trpc.videos.onGenerateDescription.useSubscription(
        generateDescription.data ? { videoId: video.id } : skipToken,
        {
            onData(data) {
                if (data && data.status) setDescriptionStatus(data.status);
                if (data.status === VideoStatus.Finished) {
                    setDescriptionStatus("");
                    utils.studio.getOne.invalidate({ id: video.id });
                    utils.studio.getMany.invalidate();
                }
            },
        },
    );

    const [thumbnailStatus, setThumbnailStatus] = useState("");
    const onThumbnailStatus = trpc.videos.onGenerateThumbnail.useSubscription(
        generateThumbnail.data ? { videoId: video.id } : skipToken,
        {
            onData(data) {
                if (data && data.status) setThumbnailStatus(data.status);
                if (data.status === VideoStatus.Finished) {
                    setThumbnailStatus("");
                    utils.studio.getOne.invalidate({ id: video.id });
                    utils.studio.getMany.invalidate();
                }
            },
        },
    );

    function isDisablingStatus(generationStatus: string) {
        return generationStatus !== VideoStatus.Finished && generationStatus !== "";
    }

    /* --------------------------- Local Calculations --------------------------- */
    const isRefetchingVideo = videoQuery.isFetching;

    const fullVideoURL = getFullVideoUrl(video.id);

    const canRestoreThumbnail =
        video.muxPlaybackId && video.thumbnailUrl !== getDefaultMuxThumbnailUrl(video.muxPlaybackId);
    /* -------------------------------------------------------------------------- */
    /*                                    FORM                                    */
    /* -------------------------------------------------------------------------- */
    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });
    const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
        updateVideo.mutate(data);
    };

    useEffect(() => {
        if (isRefetchingVideo) {
            form.control._disableForm(true);
        } else {
            form.control._disableForm(false);
        }
    }, [isRefetchingVideo, form.control, form]);

    useEffect(() => {
        form.reset(video);
    }, [video, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-end justify-between">
                        {/* Video title */}
                        <h1 className="font-brand text-2xl font-bold">{video.title}</h1>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                disabled={updateVideo.isPending || isRefetchingVideo}
                                onClick={async () => {
                                    await utils.studio.getOne.invalidate({ id: video.id });
                                    await utils.studio.getMany.invalidate();
                                }}
                            >
                                {isRefetchingVideo ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
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
                            <Button
                                type="submit"
                                variant={"muted"}
                                disabled={
                                    updateVideo.isPending ||
                                    !form.formState.isDirty ||
                                    // !form.formState.isValid ||
                                    isRefetchingVideo
                                }
                            >
                                Save
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={"ghost"} size={"icon"}>
                                        <MoreVerticalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => deleteVideo.mutate({ id: video.id })}>
                                        <Trash2Icon />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Separator />

                    {/* Grid Layout - Two Columns 3/2 */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4 lg:col-span-3">
                            <div>
                                <h2 className="text-xl">Details</h2>
                                <p className="text-muted-foreground-alt text-xs">
                                    Fill in the fields with the information of your video
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-end justify-between gap-2">
                                                <FormLabel className="text-muted-foreground font-normal">
                                                    Title
                                                </FormLabel>
                                                <GenerateWithAIButton
                                                    disabled={
                                                        generateTitle.isPending ||
                                                        isRefetchingVideo ||
                                                        isDisablingStatus(titleStatus)
                                                    }
                                                    videoId={video.id}
                                                    status={titleStatus}
                                                    onClick={() => {
                                                        generateTitle.mutate({ id: video.id });
                                                    }}
                                                />
                                            </div>
                                            <FormControl>
                                                <Input {...field} placeholder="Add a title to your video" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                    name="title"
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-end justify-between gap-2">
                                                <FormLabel className="text-muted-foreground font-normal">
                                                    Description
                                                </FormLabel>
                                                <GenerateWithAIButton
                                                    disabled={
                                                        generateDescription.isPending ||
                                                        isRefetchingVideo ||
                                                        isDisablingStatus(descriptionStatus)
                                                    }
                                                    videoId={video.id}
                                                    status={descriptionStatus}
                                                    onClick={() => {
                                                        generateDescription.mutate({ id: video.id });
                                                    }}
                                                />
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Describe the content of your video"
                                                    value={field.value ?? ""}
                                                    rows={8}
                                                    className="resize-none"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                    name="description"
                                />

                                {/* Category */}
                                <FormField
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground font-normal">
                                                Category
                                            </FormLabel>
                                            <Popover modal>
                                                <FormControl>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="justify-between text-sm font-normal"
                                                        >
                                                            {field.value
                                                                ? categories.find((cat) => cat.id === field.value)?.name
                                                                : "Select Category..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                </FormControl>
                                                <PopoverContent align="start" className="p-0">
                                                    <Command
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value ?? undefined}
                                                        filter={(value, search) => {
                                                            if (search === "") return 1;

                                                            return !!categories
                                                                .find((cat) => cat.id === value)
                                                                ?.name.toLowerCase()
                                                                .includes(search.toLowerCase())
                                                                ? 1
                                                                : 0;
                                                        }}
                                                    >
                                                        <CommandInput placeholder="Search category..." />
                                                        <CommandList>
                                                            <CommandEmpty>No framework found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {categories.map((cat) => (
                                                                    <CommandItem
                                                                        key={cat.id}
                                                                        value={cat.id}
                                                                        onSelect={field.onChange}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value === cat.id
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0",
                                                                            )}
                                                                        />
                                                                        {cat.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                    name="categoryId"
                                />
                            </div>

                            <Separator />

                            {/* Thumbnail title and action */}
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-xl">Thumbnail</h2>
                                    <p className="text-muted-foreground-alt text-xs">
                                        Set a thumbnail that stands out to draw your viewer&apos;s attention
                                    </p>
                                </div>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant={"muted"}
                                                disabled={restoreThumbnail.isPending || !canRestoreThumbnail}
                                                onClick={() => {
                                                    if (canRestoreThumbnail) restoreThumbnail.mutate({ id: video.id });
                                                }}
                                            >
                                                <RotateCcwIcon />
                                                {/* Restore */}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                            <p className="text-muted text-xs">Restore thumbnail</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Thumbnail */}
                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground font-normal">Thumbnail</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="aspect-video w-full flex-1 md:w-full">
                                                    <VideoThumbnail
                                                        imageUrl={video.thumbnailUrl}
                                                        previewUrl={video.previewUrl}
                                                        title={video.title}
                                                        duration={0}
                                                    />
                                                </div>
                                                <div className="group aspect-video w-full flex-1 md:w-full">
                                                    <ThumbnailGenerator
                                                        onGenerate={(prompt) =>
                                                            generateThumbnail.mutate({ id: video.id, prompt })
                                                        }
                                                        status={thumbnailStatus}
                                                        disabled={
                                                            generateThumbnail.isPending ||
                                                            isRefetchingVideo ||
                                                            isDisablingStatus(thumbnailStatus)
                                                        }
                                                    />
                                                </div>
                                                <div className="border-muted-foreground aspect-video w-full flex-1 rounded-md border border-dashed md:w-full">
                                                    <ThumbnailUploader videoId={video.id} />
                                                </div>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            {/* Video Area */}

                            <UploadIsland fullVideoURL={fullVideoURL} video={video} />

                            {/* Other Actions */}
                            <FormField
                                name="visibility"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground font-normal">Visibility</FormLabel>

                                        <Select defaultValue={field.value ?? undefined} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose visibility..."></SelectValue>
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value={"public"}>Public</SelectItem>
                                                <SelectItem value={"private"}>Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}

function VideoUploadIsland({ videoId, uploadId }: { videoId: string; uploadId?: string }) {
    const utils = trpc.useUtils();

    const onSuccess = () => {
        utils.studio.getMany.invalidate();
        utils.studio.getOne.invalidate({ id: videoId });
    };

    const upload = trpc.videos.requestUpload.useMutation({
        onSuccess: onSuccess,
    });

    const endpointFetch = async () => {
        const { url } = await upload.mutateAsync({
            videoId,
            currentUploadId: uploadId,
        });

        return url;
    };

    return (
        <div>
            <VideoUploader onSuccess={onSuccess} endpoint={endpointFetch} />
        </div>
    );
}

function GenerateWithAIButton(props: { disabled: boolean; videoId: string; onClick: () => void; status: string }) {
    return (
        <div className="flex items-center gap-2">
            {!!props.status && <span className="text-muted-foreground text-xs">{props.status}</span>}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant={"muted"}
                            size={"smallIcon"}
                            disabled={props.disabled}
                            onClick={props.onClick}
                        >
                            <SparklesIcon />
                            {/* Generate */}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p className="text-muted text-xs font-medium">Generate title using AI</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

interface UploadIslandProps {
    fullVideoURL: string;
    video: StudioGetOneOutput;
}

function UploadIsland({ fullVideoURL, video }: UploadIslandProps) {
    const onVideoProcessing = trpc.videos.onVideoProcessing.useSubscription(
        { videoId: video.id },
        {
            onData(data) {
                if (data && data.status) {
                    toast.info(data.status);
                }
            },
        },
    );

    return (
        <div className="bg-background-alt flex flex-col gap-4 rounded-md p-4">
            {!video.muxUploadId ? (
                //  If no Mux Upload exists, show upload video component
                <VideoUploadIsland videoId={video.id} uploadId={video.muxUploadId ?? undefined} />
            ) : (
                // If Mux Upload exists, show video thumbnail and video player
                <>
                    {!!video.muxPlaybackId ? (
                        // If Mux Playback exists, show video player
                        <VideoPlayer playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />
                    ) : (
                        // If no Mux Playback exists, show video thumbnail
                        <div className="relative aspect-video w-full shrink-0">
                            <VideoThumbnail
                                imageUrl={video.thumbnailUrl}
                                previewUrl={video.previewUrl}
                                title={video.title}
                                duration={video.duration || 0}
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        <div>
                            {onVideoProcessing.data && (
                                <p className="text-muted-foreground text-xs">{onVideoProcessing.data.status}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Video URL</p>
                            <div className="flex items-end gap-2">
                                <Button asChild type="button" variant={"link"} className="line-clamp-1 px-0">
                                    <Link href={fullVideoURL}>{fullVideoURL}</Link>
                                </Button>
                                <CopyToClipboardButton disabled={false} targetContent={fullVideoURL} />
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Status</p>
                            <p className="h-9 py-2 text-sm font-bold">
                                {formatUppercaseFirstLetter(video.muxStatus || "Preparing")}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Subtitles</p>
                            <p className="h-9 py-2 text-sm font-bold">
                                {formatUppercaseFirstLetter(video.muxTrackStatus || "No Subtitles")}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

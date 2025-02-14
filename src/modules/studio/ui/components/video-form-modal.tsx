"use client";

import { useCallback, useState } from "react";

import {
    Check,
    ChevronsUpDown,
    CopyIcon,
    MoreVerticalIcon,
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
import { StudioGetOneOutput } from "@/trpc/types";
import ResponsiveModal from "@components/responsive-modal";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { DialogClose } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Textarea } from "@components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { cn, formatUppercaseFirstLetter, getFullVideoUrl } from "@lib/utils";
import VideoPlayer from "@modules/videos/ui/components/video-player";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

import ThumbnailUploader from "./thumbnail-uploader";
import VideoUploader from "./video-uploader";

interface VideoFormModalProps {
    video?: StudioGetOneOutput;
    onOpenChange: (isOpen: boolean) => void;
}

export default function VideoFormModal({ video, onOpenChange }: VideoFormModalProps) {
    const utils = trpc.useUtils();
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const [copyVideoLink, setCopyVideoLink] = useState(false);

    const [_, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

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

    const canRestoreThumbnail = useCallback(() => {
        return (
            !!video?.muxPlaybackId &&
            video.thumbnailUrl !== `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`
        );
    }, [video]);

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

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });

    const [openCategories, setOpenCategories] = useState(false);

    const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
        updateVideo.mutate(data);
    };

    const onCopyVideoLink = async () => {
        await navigator.clipboard.writeText(getFullVideoUrl(video?.id));
        setCopyVideoLink(true);

        setTimeout(() => {
            setCopyVideoLink(false);
        }, 2000);
    };

    return (
        <>
            <ResponsiveModal
                isOpen={!!video}
                title={""}
                onOpenChange={onOpenChange}
                hideClose
                className="max-h-screen w-full overflow-y-auto sm:max-w-7xl"
            >
                {!!video && (
                    <>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h1 className="font-brand text-2xl font-bold">{video.title}</h1>
                                            {/* <p className="text-muted-foreground text-sm">
                                                Manage your video&apos;s information
                                            </p> */}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                disabled={query.isFetching || updateVideo.isPending}
                                                onClick={() => {
                                                    utils.studio.getMany.invalidate();
                                                }}
                                            >
                                                Refresh
                                            </Button>
                                            <DialogClose asChild disabled={updateVideo.isPending}>
                                                <Button type="button" variant={"muted"}>
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                variant={"muted"}
                                                disabled={updateVideo.isPending || !form.formState.isDirty}
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
                                                    <DropdownMenuItem
                                                        onClick={() => deleteVideo.mutate({ id: video.id })}
                                                    >
                                                        <Trash2Icon />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <Separator />

                                    {/* Grid */}
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
                                                            <FormLabel className="text-muted-foreground font-normal">
                                                                Title
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Add a title to your video"
                                                                />
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
                                                            <FormLabel className="text-muted-foreground font-normal">
                                                                Description
                                                            </FormLabel>
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
                                                            <Popover
                                                                open={openCategories}
                                                                onOpenChange={setOpenCategories}
                                                                modal
                                                            >
                                                                <FormControl>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            aria-expanded={openCategories}
                                                                            className="justify-between text-sm font-normal"
                                                                        >
                                                                            {field.value
                                                                                ? categories.find(
                                                                                      (cat) => cat.id === field.value,
                                                                                  )?.name
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
                                                                            <CommandEmpty>
                                                                                No framework found.
                                                                            </CommandEmpty>
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

                                            {/* Thumbnail */}
                                            <div className="flex items-end justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl">Thumbnail</h2>
                                                    <p className="text-muted-foreground-alt text-xs">
                                                        Set a thumbnail that stands out to draw your viewer&apos;s
                                                        attention
                                                    </p>
                                                </div>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant={"muted"}
                                                                disabled={
                                                                    restoreThumbnail.isPending || !canRestoreThumbnail()
                                                                }
                                                                onClick={() => {
                                                                    if (canRestoreThumbnail())
                                                                        restoreThumbnail.mutate({ id: video.id });
                                                                }}
                                                            >
                                                                <RotateCcwIcon />
                                                                {/* Restore */}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left">
                                                            <p className="text-muted text-xs font-bold">
                                                                Restore thumbnail
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="thumbnailUrl"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel className="text-muted-foreground font-normal">
                                                            Thumbnail
                                                        </FormLabel>
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
                                                                <div className="aspect-video w-full flex-1 md:w-full">
                                                                    <div className="bg-muted border-muted-foreground flex size-full flex-col items-center justify-center rounded-md border border-dashed">
                                                                        <SparklesIcon />
                                                                        <p className="text-muted-foreground mt-2 h-6 text-center text-sm text-balance">
                                                                            Generate using AI
                                                                            <span className="text-muted-foreground/25 block h-1 text-xs">
                                                                                Limits my apply
                                                                            </span>
                                                                        </p>
                                                                    </div>
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
                                            <div className="bg-background-alt flex flex-col gap-4 rounded-md p-4">
                                                {!video.muxUploadId ? (
                                                    <>
                                                        <VideoUploadIsland
                                                            videoId={video.id}
                                                            uploadId={video.muxUploadId ?? undefined}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        {!!video.thumbnailUrl && !!video.previewUrl ? (
                                                            <VideoPlayer
                                                                playbackId={video.muxPlaybackId}
                                                                thumbnailUrl={video.thumbnailUrl}
                                                            />
                                                        ) : (
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
                                                                <p className="text-muted-foreground text-xs">
                                                                    Video URL
                                                                </p>
                                                                <div className="flex items-end gap-2">
                                                                    <Button
                                                                        asChild
                                                                        type="button"
                                                                        variant={"link"}
                                                                        className="line-clamp-1 px-0"
                                                                    >
                                                                        <Link href={getFullVideoUrl(video.id)}>
                                                                            {getFullVideoUrl(video.id)}
                                                                        </Link>
                                                                    </Button>
                                                                    <Button
                                                                        variant={"ghost"}
                                                                        size={"icon"}
                                                                        type="button"
                                                                        className="shrink-0"
                                                                        disabled={copyVideoLink}
                                                                        onClick={onCopyVideoLink}
                                                                    >
                                                                        {copyVideoLink ? <Check /> : <CopyIcon />}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground text-xs">Status</p>
                                                                <p className="h-9 py-2 text-sm font-bold">
                                                                    {formatUppercaseFirstLetter(
                                                                        video.muxStatus || "Preparing",
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground text-xs">
                                                                    Subtitles
                                                                </p>
                                                                <p className="h-9 py-2 text-sm font-bold">
                                                                    {formatUppercaseFirstLetter(
                                                                        video.muxTrackStatus || "No Subtitles",
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Other Actions */}
                                            <FormField
                                                name="visibility"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-muted-foreground font-normal">
                                                            Visibility
                                                        </FormLabel>

                                                        <Select
                                                            defaultValue={field.value ?? undefined}
                                                            onValueChange={field.onChange}
                                                        >
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
                    </>
                )}
            </ResponsiveModal>
        </>
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

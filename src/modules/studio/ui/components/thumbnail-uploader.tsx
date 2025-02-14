"use client";

import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { trpc } from "@/trpc/client";
import { UploadDropzone } from "@lib/uploadthing";

interface ThumbnailUploaderProps {
    videoId: string;
}

export default function ThumbnailUploader({ videoId }: ThumbnailUploaderProps) {
    const utils = trpc.useUtils();

    const onUploadComplete = () => {
        toast.success("Thumbnail uploaded successfully");
        utils.studio.getOne.invalidate({ id: videoId });
        utils.studio.getMany.invalidate();
    };
    const onUploadBegin = () => {
        toast.info("Uploading thumbnail...");
    };
    const onError = (error: Error) => {
        toast.error(`An error occurred: ${error.message}`);
    };

    return (
        <UploadDropzone
            config={{
                cn: twMerge,
            }}
            onUploadError={onError}
            onUploadBegin={onUploadBegin}
            onClientUploadComplete={onUploadComplete}
            endpoint={"thumbnailUploader"}
            input={{ videoId }}
            appearance={{
                container: "bg-muted group relative aspect-video p-0 overflow-hidden m-0",
                button: "text-xs bg-accent px-4 py-2 h-auto w-auto m-0 mt-2 ut-readying:bg-accent/50 ut-uploading:bg-accent/50 after:bg-accent",
                label: "text-muted-foreground font-normal text-sm m-0 mt-2 hover:text-foreground group-hover:text-foreground group-hover:underline",
                allowedContent: "hidden",
            }}
            content={{
                uploadIcon: <ImagePlusIcon />,
            }}
            className="font-sans"
        />
    );
}

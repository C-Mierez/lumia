"use client";

import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { useTRPC } from "@/trpc/client";
import { UploadDropzone } from "@lib/uploadthing";
import { useQueryClient } from "@tanstack/react-query";

interface BannerUploaderProps {
    userId: string;
}

export default function BannerUploader({ userId }: BannerUploaderProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const onUploadComplete = async () => {
        toast.success("Banner uploaded successfully");
        // TODO Invalidate corresponding queries
        await queryClient.invalidateQueries({ queryKey: trpc.channels.getOne.queryKey({ userId }) });
    };
    const onUploadBegin = () => {
        toast.info("Uploading banner...");
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
            endpoint={"bannerUploader"}
            input={{ userId }}
            appearance={{
                container:
                    "bg-background-alt group hover:bg-muted cursor-pointer relative aspect-video p-0 overflow-hidden m-0",
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

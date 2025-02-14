import Image from "next/image";

import SVG from "@components/svg/svg";
import { cn, formatVideoDuration } from "@lib/utils";

interface VideoThumbnailProps {
    title: string;
    imageUrl?: string | null;
    previewUrl?: string | null;
    duration: number;
}

export default function VideoThumbnail({ title, imageUrl, previewUrl, duration }: VideoThumbnailProps) {
    return (
        <div className="group relative overflow-hidden">
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
                {!!imageUrl || !!previewUrl ? (
                    <>
                        <div className="bg-muted repeat-[8] absolute inset-0 animate-pulse" />
                        {!!previewUrl && (
                            <Image alt={title} src={previewUrl} fill className="object-cover group-hover:opacity-100" />
                        )}
                        {!!imageUrl && (
                            <Image
                                alt={title}
                                src={imageUrl}
                                fill
                                className={cn(
                                    "object-cover transition-opacity duration-200",
                                    !!previewUrl && "group-hover:opacity-0",
                                )}
                            />
                        )}
                    </>
                ) : (
                    <SVG.PlaceholderVideo className="size-full" />
                )}
            </div>
            {!!duration && (
                <div className="bg-background/50 absolute right-0 bottom-0 rounded-tl-md rounded-bl-md p-1 text-xs">
                    {formatVideoDuration(duration)}
                </div>
            )}
        </div>
    );
}

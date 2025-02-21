import { UseFormReturn } from "react-hook-form";

import { StudioGetOneOutput } from "@/trpc/types";
import { FormField, FormItem, FormLabel } from "@components/ui/form";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";

import ThumbnailGenerator from "../thumbnail-generator";
import ThumbnailUploader from "../thumbnail-uploader";
import { VideoUpdateSchema } from "./video-update-form";

interface ThumbnailFieldProps {
    form: UseFormReturn<VideoUpdateSchema>;
    video: StudioGetOneOutput;
}

export function ThumbnailField({ form, video }: ThumbnailFieldProps) {
    return (
        <FormField
            name="thumbnailUrl"
            control={form.control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-muted-foreground font-normal">Thumbnail</FormLabel>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="aspect-video w-full md:w-full">
                            <VideoThumbnail
                                imageUrl={video.thumbnailUrl}
                                previewUrl={video.previewUrl}
                                title={video.title}
                                duration={0}
                            />
                        </div>
                        <div className="group aspect-video w-full flex-1 md:w-full">
                            <ThumbnailGenerator video={video} disabled={false} />
                        </div>

                        <div className="border-muted-foreground/50 aspect-video w-full rounded-md border border-dashed md:w-full">
                            <ThumbnailUploader videoId={video.id} />
                        </div>
                    </div>
                </FormItem>
            )}
        />
    );
}

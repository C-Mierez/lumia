import { UseFormReturn } from "react-hook-form";

import { videoVisibilityEnum } from "@/db/schema";
import { StudioGetOneOutput } from "@/trpc/types";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { formatUppercaseFirstLetter } from "@lib/utils";

import { VideoUpdateSchema } from "./video-update-form";

interface VisibilityFieldProps {
    form: UseFormReturn<VideoUpdateSchema>;
    video: StudioGetOneOutput;
}

const descriptions = [
    "Everyone can watch your video",
    "Only you can watch your video",
    "Anyone with the video link can watch your video",
];

export function VisibilityField({ form, video }: VisibilityFieldProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="visibility"
                rules={{
                    validate: {
                        mustBeProcessed: (value) => {
                            if (value === "public" && !video.muxPlaybackId) {
                                return "You can't set the visibility to public until the video is processed";
                            } else {
                                return true;
                            }
                        },
                    },
                }}
                render={({ field }) => (
                    <FormItem className="p-0">
                        <FormLabel className="text-muted-foreground hidden font-normal">Video Visibility</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col"
                            >
                                {videoVisibilityEnum.enumValues.map((visibility, i) => {
                                    return (
                                        <FormItem key={visibility} className="flex items-center space-y-0 space-x-3">
                                            <FormControl>
                                                <RadioGroupItem value={visibility} />
                                            </FormControl>
                                            <div>
                                                <FormLabel className="font-normal">
                                                    {formatUppercaseFirstLetter(visibility)}
                                                </FormLabel>
                                                <FormDescription className="text-xs">{descriptions[i]}</FormDescription>
                                            </div>
                                        </FormItem>
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

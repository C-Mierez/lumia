import { and, eq, getTableColumns } from "drizzle-orm";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { categoriesTable, videosTable } from "@/db/schema";
import { cacheEvent, publishToEventChannel } from "@lib/server/event-channel";
import { generateGeminiContent } from "@lib/server/gemini";
import { generateWorkersAIImage } from "@lib/server/workersai";
import { getDefaultMuxTrackUrl } from "@lib/utils";
import { buildEventChannelName, VideoEvents, VideoProcedures } from "@modules/videos/server/constants";
import { serve } from "@upstash/workflow/nextjs";

type InputType = {
    userId: string;
    videoId: string;
    prompt: string;
};

const VIDEO_THUMBNAIL_SYSTEM_PROMPT = `Your task is to generate a prompt to use as input for an image generation AI model. You have to create a thumbnail image for a video. You will receive the transcript of the video and its metadata. Please follow these guidelines:
- Be concise but descriptive, make a thumbnail that truly represents the content of the video.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports the art style.
- ONLY return the prompt as plain text. Do not add quotes or any additional formatting or special characters.`;

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/thumbnail");

    const { POST: handler } = serve<InputType>(
        async (context) => {
            const input = context.requestPayload;
            const { videoId, userId, prompt } = input;

            const video = await context.run(VideoEvents.GetVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                    VideoEvents.GetVideo,
                );

                const [video] = await db
                    .select({ ...getTableColumns(videosTable), category: { ...getTableColumns(categoriesTable) } })
                    .from(videosTable)
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .leftJoin(categoriesTable, eq(videosTable.categoryId, categoriesTable.id));

                return video;
            });

            if (!video) throw new Error("Video not found");

            await context.run(VideoEvents.CleanUp, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                    VideoEvents.CleanUp,
                );

                if (video.thumbnailKey) {
                    const utapi = new UTApi();
                    await utapi.deleteFiles(video.thumbnailKey);

                    await db
                        .update(videosTable)
                        .set({
                            thumbnailUrl: null,
                            thumbnailKey: null,
                            updatedAt: new Date(),
                        })
                        .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)));
                }
            });

            // Only generate a prompt if it's not provided
            let finalPrompt = prompt;
            if (!prompt) {
                const transcript = await context.run(VideoEvents.GetTranscript, async () => {
                    publishToEventChannel(
                        buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                        VideoEvents.GetTranscript,
                    );

                    const trackUrl = getDefaultMuxTrackUrl(video.muxPlaybackId!, video.muxTrackId!);
                    // Fetch the transcript from the Mux track URL
                    const response = await fetch(trackUrl);

                    if (!response.ok) throw new Error("Failed to fetch transcript");

                    const responseText = await response.text();
                    if (!responseText) throw new Error("Bad request");

                    return responseText;
                });

                finalPrompt = await context.run(VideoEvents.GeneratePrompt, async () => {
                    publishToEventChannel(
                        buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                        VideoEvents.GeneratePrompt,
                    );

                    const videoData = `Video Title: ${video.title ?? "Untitled"}\nVideo Description: ${video.description ?? "No description"}\nCategory:${video.category?.name ?? "No Category"}\nTranscript: ${transcript}`;

                    const result = await generateGeminiContent(VIDEO_THUMBNAIL_SYSTEM_PROMPT, videoData);

                    if (!result.response) throw new Error("Failed to generate title");

                    return result.response.text();
                });
            }

            const uploadData = await context.run(VideoEvents.GenerateThumbnail, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                    VideoEvents.GenerateThumbnail,
                );

                const response = await generateWorkersAIImage(finalPrompt);

                if (!response.ok) throw new Error("Failed to generate thumbnail", { cause: response.statusText });

                const blob = await response.blob();

                const imageFile = new File([blob], "thumbnail.png", { type: "image/png" });

                const utapi = new UTApi();
                const [upload] = await utapi.uploadFiles([imageFile]);

                if (upload.error) throw new Error(`Failed to generate title ${upload.error.message}`);

                return upload.data;
            });

            await context.run(VideoEvents.UpdateVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                    VideoEvents.UpdateVideo,
                );

                const [updatedVideo] = await db
                    .update(videosTable)
                    .set({
                        thumbnailUrl: uploadData.ufsUrl,
                        thumbnailKey: uploadData.key,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .returning();

                if (!updatedVideo) throw new Error("Video not found");

                return updatedVideo;
            });

            publishToEventChannel(
                buildEventChannelName(videoId, VideoProcedures.GenerateThumbnail),
                VideoEvents.Finished,
            );
        },
        {
            failureFunction: async ({ context, failStatus, failResponse, failHeaders }) => {
                console.error("Failed to process video description workflow", failResponse);

                const channel = buildEventChannelName(
                    context.requestPayload.videoId,
                    VideoProcedures.GenerateThumbnail,
                );

                publishToEventChannel(channel, VideoEvents.Error);

                cacheEvent(channel, VideoEvents.Error);
            },
        },
    );

    return await handler(request);
};

import { and, eq, getTableColumns } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { categoriesTable, videosTable } from "@/db/schema";
import { cacheEvent, publishToEventChannel } from "@lib/server/event-channel";
import { generateGeminiContent } from "@lib/server/gemini";
import { getDefaultMuxTrackUrl } from "@lib/utils";
import { buildEventChannelName, VideoEvents, VideoProcedures } from "@modules/videos/server/constants";
import { serve } from "@upstash/workflow/nextjs";

type InputType = {
    userId: string;
    videoId: string;
};

const VIDEO_DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Make a description in the format that would be expected from a Youtube video description.
- The description should be at least 400 characters long.`;

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/description");

    const { POST: handler } = serve<InputType>(
        async (context) => {
            const input = context.requestPayload;
            const { videoId, userId } = input;

            const video = await context.run(VideoEvents.GetVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateDescription),
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
            if (!video.muxAssetId || !video.muxPlaybackId || !video.muxTrackId)
                throw new Error("Video asset, playback or track not found");

            const transcript = await context.run(VideoEvents.GetTranscript, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateDescription),
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

            const generatedDescription = await context.run(VideoEvents.GenerateDescription, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateDescription),
                    VideoEvents.GenerateDescription,
                );

                const finalPrompt = `Video Title: ${video.title ?? "Untitled"}\nCategory:${video.category?.name ?? "No Category"}\nTranscript: ${transcript}`;

                const result = await generateGeminiContent(VIDEO_DESCRIPTION_SYSTEM_PROMPT, finalPrompt, 350);

                if (!result.response) throw new Error("Failed to generate description");

                return result.response.text();
            });

            await context.run(VideoEvents.UpdateVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateDescription),
                    VideoEvents.UpdateVideo,
                );

                const [updatedVideo] = await db
                    .update(videosTable)
                    .set({
                        description: generatedDescription,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .returning();

                if (!updatedVideo) throw new Error("Video not found");

                return updatedVideo;
            });

            publishToEventChannel(
                buildEventChannelName(videoId, VideoProcedures.GenerateDescription),
                VideoEvents.Finished,
            );
        },
        {
            failureFunction: async ({ context, failStatus, failResponse, failHeaders }) => {
                console.error("Failed to process video description workflow", failResponse);

                const channel = buildEventChannelName(
                    context.requestPayload.videoId,
                    VideoProcedures.GenerateDescription,
                );

                publishToEventChannel(channel, VideoEvents.Error);

                cacheEvent(channel, VideoEvents.Error);
            },
        },
    );

    return await handler(request);
};

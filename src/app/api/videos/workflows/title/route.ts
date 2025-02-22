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

const VIDEO_TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting or special characters.`;

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/title");
    const { POST: handler } = serve<InputType>(
        async (context) => {
            const input = context.requestPayload;
            const { videoId, userId } = input;

            const video = await context.run(VideoEvents.GetVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateTitle),
                    VideoEvents.GetVideo,
                );

                const [video] = await db
                    .select({ ...getTableColumns(videosTable), category: { ...getTableColumns(categoriesTable) } })
                    .from(videosTable)
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .innerJoin(categoriesTable, eq(videosTable.categoryId, categoriesTable.id));

                return video;
            });

            if (!video) throw new Error("Video not found");
            if (!video.muxAssetId || !video.muxPlaybackId || !video.muxTrackId)
                throw new Error("Video asset, playback or track not found");

            const transcript = await context.run(VideoEvents.GetTranscript, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateTitle),
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

            const generatedTitle = await context.run(VideoEvents.GenerateTitle, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateTitle),
                    VideoEvents.GenerateTitle,
                );

                const finalPrompt = `Video Description: ${video.description ?? "No description"}\nCategory:${video.category.name ?? "No Category"}\nTranscript: ${transcript}`;

                const result = await generateGeminiContent(VIDEO_TITLE_SYSTEM_PROMPT, finalPrompt);

                if (!result.response) throw new Error("Failed to generate title");

                return result.response.text();
            });

            await context.run(VideoEvents.UpdateVideo, async () => {
                publishToEventChannel(
                    buildEventChannelName(videoId, VideoProcedures.GenerateTitle),
                    VideoEvents.UpdateVideo,
                );

                const [updatedVideo] = await db
                    .update(videosTable)
                    .set({
                        title: generatedTitle,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .returning();

                if (!updatedVideo) throw new Error("Video not found");

                return updatedVideo;
            });

            publishToEventChannel(buildEventChannelName(videoId, VideoProcedures.GenerateTitle), VideoEvents.Finished);
        },
        {
            failureFunction: async ({ context, failStatus, failResponse, failHeaders }) => {
                console.error("Failed to process video title workflow", failResponse);

                const channel = buildEventChannelName(context.requestPayload.videoId, VideoProcedures.GenerateTitle);

                publishToEventChannel(channel, VideoEvents.Error);

                cacheEvent(channel, VideoEvents.Error);
            },
        },
    );

    return await handler(request);
};

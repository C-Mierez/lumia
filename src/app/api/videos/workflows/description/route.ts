import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { VideoEvents } from "@lib/server/events";
import { generateGeminiContent } from "@lib/server/gemini";
import { StepLogger } from "@lib/server/workflow";
import { getDefaultMuxTrackUrl } from "@lib/utils";
import { WorkflowLogger } from "@upstash/workflow";
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
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/description");

    const { POST: handler } = serve(
        async (context) => {
            const input = context.requestPayload as InputType;
            const { videoId, userId } = input;

            const video = await context.run(VideoEvents.GetVideo, async () => {
                const [video] = await db
                    .select()
                    .from(videosTable)
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)));

                return video;
            });

            if (!video) throw new Error("Video not found");
            if (!video.muxAssetId || !video.muxPlaybackId || !video.muxTrackId)
                throw new Error("Video asset, playback or track not found");

            const transcript = await context.run(VideoEvents.GetTranscript, async () => {
                const trackUrl = getDefaultMuxTrackUrl(video.muxPlaybackId!, video.muxTrackId!);
                console.log("Fetching transcript from:", trackUrl);
                // Fetch the transcript from the Mux track URL
                const response = await fetch(trackUrl);

                if (!response.ok) throw new Error("Failed to fetch transcript");

                const responseText = await response.text();
                if (!responseText) throw new Error("Bad request");

                return responseText;
            });

            const generatedDescription = await context.run(VideoEvents.GenerateDescription, async () => {
                const result = await generateGeminiContent(VIDEO_DESCRIPTION_SYSTEM_PROMPT, transcript);

                if (!result.response) throw new Error("Failed to generate description");

                return result.response.text();
            });

            await context.run(VideoEvents.UpdateVideo, async () => {
                const [updatedVideo] = await db
                    .update(videosTable)
                    .set({
                        description: generatedDescription,
                    })
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                    .returning();

                if (!updatedVideo) throw new Error("Video not found");

                return updatedVideo;
            });
        },
        {
            verbose: new StepLogger() as unknown as WorkflowLogger,
        },
    );

    return await handler(request);
};

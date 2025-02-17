import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { createCallerFactory, createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
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

const VIDEO_TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting or special characters.`;

export const POST = async (request: NextRequest) => {
    console.log("API Post request on video/workflows/title");
    const { POST: handler } = serve(
        async (context) => {
            const input = context.requestPayload as InputType;
            const { videoId, userId } = input;

            const video = await context.run(VideoEvents.GetVideo, async () => {
                const caller = createCallerFactory(appRouter)(await createTRPCContext({ headers: request.headers }));

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

            const generatedTitle = await context.run(VideoEvents.GenerateTile, async () => {
                const result = await generateGeminiContent(VIDEO_TITLE_SYSTEM_PROMPT, transcript);

                if (!result.response) throw new Error("Failed to generate title");

                return result.response.text();
            });

            await context.run(VideoEvents.UpdateVideo, async () => {
                const [updatedVideo] = await db
                    .update(videosTable)
                    .set({
                        title: generatedTitle,
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

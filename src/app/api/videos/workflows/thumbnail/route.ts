import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { generateGeminiContent } from "@lib/server/gemini";
import { getDefaultMuxTrackUrl } from "@lib/utils";
import { generateWorkersAIImage } from "@lib/server/workersai";
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

    const { POST: handler } = serve(async (context) => {
        const input = context.requestPayload as InputType;
        const { videoId, userId, prompt } = input;

        const video = await context.run("get-video", async () => {
            const [video] = await db
                .select()
                .from(videosTable)
                .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)));

            return video;
        });

        if (!video) throw new Error("Video not found");

        await context.run("delete-previous-thumbnail", async () => {
            if (video.thumbnailKey) {
                const utapi = new UTApi();
                await utapi.deleteFiles(video.thumbnailKey);

                await db
                    .update(videosTable)
                    .set({
                        thumbnailUrl: null,
                        thumbnailKey: null,
                    })
                    .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)));
            }
        });

        // Only generate a prompt if it's not provided
        let finalPrompt = prompt;
        if (!prompt) {
            const transcript = await context.run("get-transcript", async () => {
                const trackUrl = getDefaultMuxTrackUrl(video.muxPlaybackId!, video.muxTrackId!);
                console.log("Fetching transcript from:", trackUrl);
                // Fetch the transcript from the Mux track URL
                const response = await fetch(trackUrl);

                if (!response.ok) throw new Error("Failed to fetch transcript");

                const responseText = await response.text();
                if (!responseText) throw new Error("Bad request");

                return responseText;
            });

            finalPrompt = await context.run("generate-prompt", async () => {
                const videoData = `Video Title: ${video.title ?? "Untitled"}\nVideo Description: ${video.description ?? "No description"}\nTranscript: ${transcript}`;

                const result = await generateGeminiContent(VIDEO_THUMBNAIL_SYSTEM_PROMPT, videoData);

                if (!result.response) throw new Error("Failed to generate title");

                return result.response.text();
            });
        }

        const uploadData = await context.run("generate-thumbnail and store", async () => {
            console.log("Generating thumbnail with prompt:", finalPrompt);
            const response = await generateWorkersAIImage(finalPrompt);

            if (!response.ok) throw new Error("Failed to generate thumbnail");

            const blob = await response.blob();

            const imageFile = new File([blob], "thumbnail.png", { type: "image/png" });

            const utapi = new UTApi();
            const [upload] = await utapi.uploadFiles([imageFile]);

            if (upload.error) throw new Error(`Failed to generate title ${upload.error.message}`);

            return upload.data;
        });

        await context.run("update-video", async () => {
            const [updatedVideo] = await db
                .update(videosTable)
                .set({
                    thumbnailUrl: uploadData.ufsUrl,
                    thumbnailKey: uploadData.key,
                })
                .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
                .returning();

            if (!updatedVideo) throw new Error("Video not found");

            return updatedVideo;
        });
    });

    return await handler(request);
};

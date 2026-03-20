import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";

export const GenAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const DEFAULT_MODEL = "gemini-2.5-flash";

export const DEFAULT_IMAGE_MODEL = "nano-banana-pro-preview";

export function generateGeminiContent(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 1000,
    modelName: string = DEFAULT_MODEL,
) {
    return GenAI.models.generateContent({
        model: modelName,
        config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: maxTokens,
        },
        contents: {
            role: "user",
            text: userPrompt,
        },
    });
}

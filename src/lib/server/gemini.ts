import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const GenAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const DEFAULT_MODEL = "gemini-2.0-flash";

export function generateGeminiContent(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 75,
    modelName: string = DEFAULT_MODEL,
) {
    const model = GenAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    return model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: userPrompt,
                    },
                ],
            },
        ],
        generationConfig: {
            maxOutputTokens: maxTokens,
        },
    });
}

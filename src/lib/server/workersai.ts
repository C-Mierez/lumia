import { env } from "@/env";

export async function generateWorkersAIImage(prompt: string) {
    const model = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

    const apiURL = `https://api.cloudflare.com/client/v4/accounts/${env.WORKERSAI_ACCOUNT_ID}/ai/run/${model}`;

    const response = fetch(apiURL, {
        headers: {
            Authorization: `Bearer ${env.WORKERSAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
            prompt: prompt,
            height: 1080,
            width: 1920,
        }),
    });

    return response;
}

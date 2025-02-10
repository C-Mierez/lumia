import { headers } from "next/headers";
import { Webhook } from "svix";

import { env } from "@/env";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const SIGNING_SECRET = env.CLERK_SIGN_IN_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing Svix headers", {
            status: 400,
        });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error: Could not verify webhook:", err);
        return new Response("Error: Verification error", {
            status: 400,
        });
    }

    // Do something with payload
    // For this guide, log payload to console
    const eventType = evt.type;

    // Handle different event types
    switch (eventType) {
        // User created
        case "user.created":
            let name = !!evt.data.first_name && !!evt.data.last_name && `${evt.data.first_name} ${evt.data.last_name}`;
            name = !name ? evt.data.email_addresses[0].email_address : name;
            await db.insert(usersTable).values({
                clerkId: evt.data.id,
                name,
                imageUrl: evt.data.image_url,
            });
            break;

        case "user.updated":
            await db
                .update(usersTable)
                .set({
                    name: `${evt.data.first_name} ${evt.data.last_name}`,
                    imageUrl: evt.data.image_url,
                })
                .where(eq(usersTable.clerkId, evt.data.id));
            break;

        case "user.deleted":
            if (!evt.data.id) {
                return new Response("Error: Missing user ID", {
                    status: 400,
                });
            }

            await db.delete(usersTable).where(eq(usersTable.clerkId, evt.data.id));
            break;

        default:
            break;
    }

    return new Response("Webhook received", { status: 200 });
}

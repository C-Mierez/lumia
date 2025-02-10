import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient, trpc } from "@/trpc/server";

import HomeClient from "./client";

export const dynamic = "force-dynamic";

export default async function Home() {
    void trpc.hello.prefetch({ text: "John" });

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <HomeClient />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
}

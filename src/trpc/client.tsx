"use client";
import { useState } from "react";

import superjson from "superjson";

import { env } from "@/env";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink, splitLink, unstable_httpSubscriptionLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

// export const trpc = createTRPCReact<AppRouter>();

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return makeQueryClient();
    }
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {
    const base = (() => {
        if (typeof window !== "undefined") return "";
        if (env.NEXT_PUBLIC_WEBSITE_URL) return `https://${env.NEXT_PUBLIC_WEBSITE_URL}`;
        return "http://localhost:3000";
    })();
    return `${base}/api/trpc`;
}

export function TRPCReactProvider(
    props: Readonly<{
        children: React.ReactNode;
    }>,
) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient();
    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                loggerLink({
                    enabled: (op) =>
                        process.env.VERCEL_URL === "development" ||
                        (op.direction === "down" && op.result instanceof Error),
                }),
                splitLink({
                    // uses the httpSubscriptionLink for subscriptions
                    condition: (op) => op.type === "subscription",
                    true: unstable_httpSubscriptionLink({
                        transformer: superjson,
                        url: getUrl(),
                    }),
                    false: httpBatchLink({
                        transformer: superjson,
                        url: getUrl(),
                        async headers() {
                            const headers = new Headers();
                            headers.set("x-trpc-source", "nextjs-react");
                            return headers;
                        },
                    }),
                }),
            ],
        }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}

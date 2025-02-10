"use client";

import { trpc } from "@/trpc/client";

export default function HomeClient() {
    const [data] = trpc.hello.useSuspenseQuery({
        text: "John",
    });

    return <>Home Client {data.greeting}</>;
}

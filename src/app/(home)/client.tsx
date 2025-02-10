"use client";

import { trpc } from "@/trpc/client";

export default function HomeClient() {
    const [data] = trpc.categories.getMany.useSuspenseQuery();

    return <>{JSON.stringify(data)}</>;
}

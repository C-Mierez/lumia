"use client";

import { trpc } from "@/trpc/client";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";

export default function VideosSection() {
    const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    return <div>{JSON.stringify(data)}</div>;
}

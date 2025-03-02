import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import SubscriptionsView from "@modules/home/ui/views/subscriptions-view";

export const dynamic = "force-dynamic";

interface SubscriptionsPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
    const { category } = await searchParams;

    prefetch(trpc.categories.getMany.queryOptions());

    void prefetch(
        trpc.home.searchManySubscriptions.infiniteQueryOptions({
            searchCategory: category,
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <SubscriptionsView searchCategoryId={category} />
        </HydrateClient>
    );
}

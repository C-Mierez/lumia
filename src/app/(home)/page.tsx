import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import HomeView from "@modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface HomeProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function Home({ searchParams }: HomeProps) {
    const { category } = await searchParams;

    prefetch(trpc.categories.getMany.queryOptions());

    void prefetch(
        trpc.home.searchMany.infiniteQueryOptions({
            searchQuery: null,
            searchCategory: category,
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <HomeView searchCategoryId={category} />
        </HydrateClient>
    );
}

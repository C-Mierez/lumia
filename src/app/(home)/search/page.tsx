import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { SEARCH_PARAMS } from "@lib/searchParams";
import SearchView from "@modules/home/ui/views/search-view";

export const dynamic = "force-dynamic";

interface SearchPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { s, category } = await searchParams;

    void prefetch(trpc.categories.getMany.queryOptions());

    void prefetch(
        trpc.home.searchMany.infiniteQueryOptions({
            searchQuery: s,
            searchCategory: category,
            limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
        }),
    );

    return (
        <HydrateClient>
            <SearchView searchQuery={s} searchCategoryId={category} />
        </HydrateClient>
    );
}

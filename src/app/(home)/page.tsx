import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SEARCH_PARAMS } from "@lib/searchParams";
import HomeView from "@modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface HomeProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function Home({ searchParams }: HomeProps) {
    const { category } = await searchParams;

    prefetch(trpc.categories.getMany.queryOptions());

    return (
        <HydrateClient>
            <HomeView categoryId={category} />
        </HydrateClient>
    );
}

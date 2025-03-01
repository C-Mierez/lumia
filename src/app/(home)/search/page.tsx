import { SEARCH_PARAMS } from "@lib/searchParams";

export const dynamic = "force-dynamic";

interface SearchPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { s, category } = await searchParams;

    return (
        <div>
            Searching for {s} in {category}
        </div>
    );
}

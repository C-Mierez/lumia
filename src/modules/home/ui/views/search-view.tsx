import { Separator } from "@components/ui/separator";
import CategoriesSection from "../sections/categories-section";
import SearchSection from "../sections/search-section";

interface SearchViewProps {
    searchQuery?: string;
    searchCategoryId?: string;
}

export default function SearchView({ searchQuery, searchCategoryId }: SearchViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <CategoriesSection categoryId={searchCategoryId} />
            <Separator />
            <SearchSection searchQuery={searchQuery} searchCategoryId={searchCategoryId} />
        </div>
    );
}

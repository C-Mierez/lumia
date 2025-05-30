import { Separator } from "@components/ui/separator";

import CategoriesSection from "../sections/categories-section";
import HomeSection from "../sections/home-section";

interface HomeViewProps {
    searchCategoryId?: string;
    isTrending?: boolean;
}

export default function HomeView({ isTrending = false, searchCategoryId }: HomeViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <CategoriesSection categoryId={searchCategoryId} />
            <Separator />
            <HomeSection searchCategoryId={searchCategoryId} isTrending={isTrending} />
        </div>
    );
}

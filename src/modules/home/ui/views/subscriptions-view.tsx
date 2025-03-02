import { Separator } from "@components/ui/separator";

import CategoriesSection from "../sections/categories-section";
import SubscriptionsSection from "../sections/subscriptions-section";

interface SubscriptionsViewProps {
    searchCategoryId?: string;
}

export default function SubscriptionsView({ searchCategoryId }: SubscriptionsViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <CategoriesSection categoryId={searchCategoryId} />
            <Separator />
            <SubscriptionsSection searchCategoryId={searchCategoryId} />
        </div>
    );
}

import CategoriesSection from "../sections/categories-section";

interface HomeViewProps {
    categoryId?: string;
}

export default function HomeView({ categoryId }: HomeViewProps) {
    return (
        <div className="flex max-w-[var(--screen-max)] flex-col gap-y-6 px-4 py-2">
            <CategoriesSection categoryId={categoryId} />
        </div>
    );
}

"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import CarouselFilter from "@components/carousel-filter";

interface CategoriesSectionProps {
    categoryId?: string;
}

export default function CategoriesSection({ categoryId }: CategoriesSectionProps) {
    return (
        <Suspense fallback={<CategoriesFallback />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <CategoriesSectionSuspense categoryId={categoryId} />
            </ErrorBoundary>
        </Suspense>
    );
}

function CategoriesSectionSuspense({ categoryId }: CategoriesSectionProps) {
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const data = categories.map(({ id, name }) => ({
        id: id,
        label: name,
    }));

    return <CarouselFilter value={categoryId} data={data} />;
}

function CategoriesFallback() {
    return <CarouselFilter data={[]} isLoading />;
}

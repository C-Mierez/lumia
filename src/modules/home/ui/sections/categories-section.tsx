"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import CarouselFilter from "@components/carousel-filter";
import { useSuspenseQuery } from "@tanstack/react-query";

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
    const trpc = useTRPC();

    const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

    const categories = data.map(({ id, name }) => ({
        id: id,
        label: name,
    }));

    return <CarouselFilter selectedItemId={categoryId} items={categories} searchKey={"category"} />;
}

function CategoriesFallback() {
    return <CarouselFilter isLoading searchKey={"category"} />;
}

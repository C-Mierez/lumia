"use client";

import { useCallback, useEffect, useState } from "react";

import { EmblaCarouselType } from "embla-carousel";
import Link from "next/link";

import { buildSearchQuery, SEARCH_KEYS_ALL } from "@lib/searchParams";
import { cn, range } from "@lib/utils";

import { Badge } from "./ui/badge";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface CarouselFilterProps {
    selectedItemId?: string;
    items?: {
        id: string;
        label: string;
    }[];
    searchKey: SEARCH_KEYS_ALL;
    isLoading?: boolean;
}

export default function CarouselFilter({
    selectedItemId,
    isLoading = false,
    items = [],
    searchKey,
}: CarouselFilterProps) {
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCurrentItemIndex(api.selectedScrollSnap() + 1);
    }, []);

    useEffect(() => {
        if (!carouselApi) return;

        setTotalItems(carouselApi.scrollSnapList().length);
        setCurrentItemIndex(carouselApi.selectedScrollSnap() + 1);

        carouselApi.on("select", onSelect);

        return () => {
            carouselApi.off("select", onSelect);
            carouselApi.destroy();
        };
    }, [carouselApi]);

    return (
        <div className="relative w-full select-none">
            <Carousel
                setApi={setCarouselApi}
                opts={{
                    align: "start",
                    dragFree: true,
                }}
                className="w-full px-11"
            >
                {/* Scroll Buttons */}
                <CarouselPrevious className="left-0 z-20 size-8" />
                <CarouselNext className="right-0 z-20 size-8" />

                {/* Items */}
                <CarouselContent className="-ml-3">
                    {/* Skeleton Badges */}
                    {isLoading &&
                        range(18).map((_, i) => {
                            return <CarouselBadgeSkeleton key={i} />;
                        })}

                    {/* All Badges */}
                    {!isLoading && (
                        <>
                            <CarouselBadge
                                id={"AllBadge"}
                                label={"All"}
                                selectedItemId={!selectedItemId ? "AllBadge" : ""}
                                searchKey={searchKey}
                                isDefault
                            ></CarouselBadge>
                            {items.map((item) => {
                                return (
                                    <CarouselBadge
                                        key={item.id}
                                        id={item.id}
                                        label={item.label}
                                        selectedItemId={selectedItemId}
                                        searchKey={searchKey}
                                    ></CarouselBadge>
                                );
                            })}
                        </>
                    )}
                </CarouselContent>
            </Carousel>

            {/* Fades */}
            <CarouselFade position="left" isActive={currentItemIndex !== 1} />
            <CarouselFade position="right" isActive={currentItemIndex !== totalItems} />
        </div>
    );
}

interface CarouselBadgeProps {
    id?: string;
    label?: string;
    selectedItemId?: string;
    isDefault?: boolean;
    searchKey: SEARCH_KEYS_ALL;
}

function CarouselBadge({ label, id, selectedItemId, isDefault = false, searchKey }: CarouselBadgeProps) {
    const [clicked, setClicked] = useState(false);
    const [currentValue, setCurrentValue] = useState(selectedItemId);

    useEffect(() => {
        if (currentValue !== selectedItemId && clicked) {
            setCurrentValue(selectedItemId);
            setClicked(false);
        }
    }, [selectedItemId, clicked, currentValue]);

    const href = isDefault ? "/" : `/${buildSearchQuery({ [searchKey]: id })}`;

    return (
        <Link href={href} onClick={() => setClicked(true)}>
            <CarouselItem
                className={cn("basis-auto pl-3 transition-opacity duration-300", clicked && "opacity-50 duration-0")}
            >
                <Badge
                    variant={selectedItemId === id || clicked ? "selected" : "default"}
                    className={cn(
                        "cursor-pointer rounded-md px-3 py-1 text-xs whitespace-nowrap",
                        // clicked ? "bg-red-500" : "",
                    )}
                >
                    {label}
                </Badge>
            </CarouselItem>
        </Link>
    );
}

function CarouselBadgeSkeleton() {
    return (
        <CarouselItem className="pointer-events-none basis-auto pl-3">
            <Skeleton className="h-full w-24 rounded-md px-3 py-1 text-xs font-semibold">&nbsp;</Skeleton>
        </CarouselItem>
    );
}

function CarouselFade({ position, isActive }: { position: "left" | "right"; isActive: boolean }) {
    return (
        <div
            className={cn(
                position === "left" ? "left-11 bg-linear-to-r" : "right-11 bg-linear-to-l",
                "from-background pointer-events-none absolute top-0 bottom-0 z-10 w-11 to-transparent transition-opacity duration-100",
                isActive ? "opacity-100" : "opacity-0",
            )}
        />
    );
}

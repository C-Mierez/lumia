"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { cn, range } from "@lib/utils";

import { Badge } from "./ui/badge";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface CarouselFilterProps {
    value?: string | null;
    isLoading?: boolean;
    data: {
        id: string;
        label: string;
    }[];
}

export default function CarouselFilter({ value, isLoading, data }: CarouselFilterProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (!api) return;

        setTotalItems(api.scrollSnapList().length);
        setCurrentItemIndex(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrentItemIndex(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <div className="relative w-full select-none">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    dragFree: true,
                }}
                className="w-full px-11"
            >
                <CarouselContent className="-ml-3">
                    {/* Placeholder Badges */}
                    {isLoading &&
                        range(18).map((_, i) => {
                            return (
                                <CarouselItem key={i} className="pointer-events-none basis-auto pl-3">
                                    <Skeleton className="h-full w-24 rounded-md px-3 py-1 text-xs font-semibold">
                                        &nbsp;
                                    </Skeleton>
                                </CarouselItem>
                            );
                        })}

                    {/* All Badges */}
                    {!isLoading && (
                        <CategoryBadge
                            id={"AllBadge"}
                            label={"All"}
                            value={!value ? "AllBadge" : ""}
                            isDefault
                        ></CategoryBadge>
                    )}
                    {!isLoading &&
                        data.map((item) => {
                            return (
                                <CategoryBadge
                                    key={item.id}
                                    id={item.id}
                                    label={item.label}
                                    value={value}
                                ></CategoryBadge>
                            );
                        })}
                </CarouselContent>
                <CarouselPrevious className="left-0 z-20 size-8" />
                <CarouselNext className="right-0 z-20 size-8" />
            </Carousel>

            {/* Fades */}
            <CarouselFade position="left" isActive={currentItemIndex !== 1} />
            <CarouselFade position="right" isActive={currentItemIndex !== totalItems} />
        </div>
    );
}

interface CategoryBadgeProps {
    value?: string | null;
    label: string;
    id: string;
    isDefault?: boolean;
}

function CategoryBadge({ label, id, value, isDefault }: CategoryBadgeProps) {
    const [clicked, setClicked] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        if (currentValue !== value && clicked) {
            setCurrentValue(value);
            setClicked(false);
        }
    }, [value]);

    return (
        <Link href={isDefault ? "/" : `?categoryId=${id}`} onClick={() => setClicked(true)}>
            <CarouselItem
                className={cn("basis-auto pl-3 transition-opacity duration-300", clicked && "opacity-50 duration-0")}
            >
                <Badge
                    variant={value === id || clicked ? "selected" : "default"}
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

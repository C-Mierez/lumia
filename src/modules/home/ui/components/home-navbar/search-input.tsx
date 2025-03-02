"use client";
import { ChangeEvent, FormEvent, useEffect } from "react";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSerializer, parseAsString } from "nuqs";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import useSafeQueryState from "@hooks/use-safe-query-state";

const serialize = createSerializer({
    s: parseAsString,
    category: parseAsString,
});

export default function SearchInput() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useSafeQueryState("s", true);
    const [categoryQuery, setCategoryQuery] = useSafeQueryState("category");

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (searchQuery && searchQuery.length > 0) {
            router.push(
                `/search${serialize({
                    s: searchQuery,
                    category: categoryQuery ?? null,
                })}`,
            );
        }
    };

    useEffect(() => {
        if (searchQuery && searchQuery.length > 0) {
            router.push(
                `/search${serialize({
                    s: searchQuery,
                    category: categoryQuery ?? null,
                })}`,
            );
        }
    }, [categoryQuery]);

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value || e.target.value.length === 0) {
            setSearchQuery(null);
        }

        if (e.target.value.length > 0) {
            setSearchQuery(e.target.value);
        }
    };

    return (
        <form className="group flex h-full w-full transition-colors" onSubmit={handleSearch}>
            <div className="relative w-full">
                <Input
                    value={searchQuery ?? ""}
                    onChange={onInputChange}
                    placeholder="Search for videos"
                    className="focus:bg-accent-600/20 focus:border-muted-foreground h-9 rounded-l-md rounded-r-none border-r-0 bg-transparent transition-colors focus:outline-none focus-visible:ring-0"
                />
                {!!searchQuery && searchQuery.length > 0 && (
                    <Button
                        type="button"
                        size={"smallIcon"}
                        variant={"muted"}
                        disabled={!searchQuery || searchQuery.length === 0}
                        className="absolute top-[50%] right-1 -translate-y-1/2 transform"
                        onClick={() => setSearchQuery(null)}
                    >
                        <XIcon />
                    </Button>
                )}
            </div>
            <Button
                type="submit"
                variant={"ghost"}
                className="group-focus-within:border-muted-foreground border-input rounded-l-none rounded-r-md border transition-colors focus:outline-none disabled:cursor-default disabled:opacity-50"
            >
                <SearchIcon />
            </Button>
        </form>
    );
}

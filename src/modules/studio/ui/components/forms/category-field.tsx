import { Check, ChevronsUpDown, ListFilterIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { useTRPC } from "@/trpc/client";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { FormControl, FormField, FormItem, FormLabel } from "@components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { cn } from "@lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VideoUpdateSchema } from "./video-update-form";

interface CategoryFieldProps {
    form: UseFormReturn<VideoUpdateSchema>;
}

export function CategoryField({ form }: CategoryFieldProps) {
    const trpc = useTRPC();
    const { data: categories } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

    return (
        <FormField
            name="categoryId"
            control={form.control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-muted-foreground font-normal">Category</FormLabel>
                    <Popover modal>
                        <FormControl>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between text-sm font-normal"
                                >
                                    {field.value ? (
                                        categories.find((cat) => cat.id === field.value)?.name
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ListFilterIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                                            {"Select Category..."}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                        </FormControl>
                        <PopoverContent align="start" className="p-0">
                            <Command
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? undefined}
                                filter={(value, search) => {
                                    if (search === "") return 1;

                                    return !!categories
                                        .find((cat) => cat.id === value)
                                        ?.name.toLowerCase()
                                        .includes(search.toLowerCase())
                                        ? 1
                                        : 0;
                                }}
                            >
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                    <CommandEmpty>No framework found.</CommandEmpty>
                                    <CommandGroup>
                                        {categories.map((cat) => (
                                            <CommandItem key={cat.id} value={cat.id} onSelect={field.onChange}>
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value === cat.id ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                {cat.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    );
}

"use client";

import { Check, ChevronsUpDown, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { StudioGetOneOutput } from "@/trpc/types";
import ResponsiveModal from "@components/responsive-modal";
import { Button } from "@components/ui/button";
import { DialogClose } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { cn } from "@lib/utils";

interface VideoFormModalProps {
    video?: StudioGetOneOutput;
    onOpenChange: (isOpen: boolean) => void;
}

export default function VideoFormModal({ video, onOpenChange }: VideoFormModalProps) {
    return (
        <>
            <ResponsiveModal
                isOpen={!!video}
                title={""}
                onOpenChange={onOpenChange}
                hideClose
                className="max-h-screen w-full overflow-y-auto sm:max-w-7xl"
            >
                {!!video && (
                    <>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h1 className="font-brand text-2xl font-bold">{video.title}</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Manage your video&apos;s information
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button variant={"muted"}>Cancel</Button>
                                    </DialogClose>
                                    <Button variant={"muted"} disabled>
                                        Save
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={"ghost"} size={"icon"}>
                                                <MoreVerticalIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Trash2Icon />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <Separator />
                            <VideoForm video={video} />
                        </div>
                    </>
                )}
            </ResponsiveModal>
        </>
    );
}

function VideoForm({ video }: { video: StudioGetOneOutput }) {
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });

    const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
        console.log(data);
    };

    const [open, setOpen] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        <h2 className="text-xl">Details</h2>
                        <div className="flex flex-col gap-4">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground font-normal">Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Add a title to your video" />
                                        </FormControl>
                                    </FormItem>
                                )}
                                name="title"
                            />
                            {/* Description */}
                            <FormField
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground font-normal">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe the content of your video"
                                                value={field.value ?? ""}
                                                rows={8}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                name="description"
                            />
                            {/* Category */}
                            <FormField
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground font-normal">Category</FormLabel>
                                        <Popover open={open} onOpenChange={setOpen} modal>
                                            <FormControl>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="justify-between text-sm font-normal"
                                                    >
                                                        {field.value
                                                            ? categories.find((cat) => cat.id === field.value)?.name
                                                            : "Select Category..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </FormControl>
                                            <PopoverContent className="p-0">
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
                                                                <CommandItem
                                                                    key={cat.id}
                                                                    value={cat.id}
                                                                    onSelect={field.onChange}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === cat.id
                                                                                ? "opacity-100"
                                                                                : "opacity-0",
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
                                name="categoryId"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-2"></div>
                </div>
            </form>
        </Form>
    );
}

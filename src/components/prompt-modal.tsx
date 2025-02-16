"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import ResponsiveModal from "./responsive-modal";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";

interface PromptModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    placeholder?: string;
    onConfirm: (promptInput: string) => void;
    onCancel: () => void;
}

const promptSchema = z.object({
    prompt: z.string(),
});

export default function PromptModal({ isOpen, title, message, placeholder, onConfirm, onCancel }: PromptModalProps) {
    const form = useForm<z.infer<typeof promptSchema>>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
            onCancel();
        }
    };

    return (
        <ResponsiveModal isOpen={isOpen} onOpenChange={onOpenChange} hideClose className="m-0 p-0">
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        // the void is for eslint because `handleSubmit` returns a promise.
                        void form.handleSubmit(({ prompt }) => {
                            onConfirm(prompt);
                            onOpenChange(false);
                        })(e);
                    }}
                    className="flex flex-col gap-4 p-4"
                >
                    <div className="text-start text-balance">
                        <h2 className="flex justify-between text-xl font-bold">{title}</h2>
                    </div>
                    {/* <Separator /> */}

                    <FormField
                        name="prompt"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground text-sm">{message}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder={placeholder} className="resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button variant={"secondary"}>Confirm</Button>
                        <Button type="button" variant={"muted"} onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
}

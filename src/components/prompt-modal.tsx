"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { ModalProps } from "@hooks/use-modal";

import ResponsiveModal from "./responsive-modal";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";

interface PromptModalProps extends ModalProps {
    title?: string;
    message: string;
    placeholder?: string;
    onConfirm: (promptInput: string) => void;
    onCancel?: () => void;
}

const promptSchema = z.object({
    prompt: z.string(),
});

export default function PromptModal(props: PromptModalProps) {
    const { onOpenChange, title, message, placeholder, onConfirm, onCancel } = props;

    const form = useForm<z.infer<typeof promptSchema>>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
            onCancel?.();
        }
        onOpenChange(isOpen);
    };

    return (
        <ResponsiveModal {...props} onOpenChange={handleOpenChange} className="m-0 p-0">
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        // the void is for eslint because `handleSubmit` returns a promise.
                        void form.handleSubmit(({ prompt }) => {
                            onConfirm(prompt);
                            handleOpenChange(false);
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
                        <Button type="button" variant={"muted"} onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
}

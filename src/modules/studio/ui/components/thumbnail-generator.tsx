"use client";

import { useState } from "react";

import { Loader2Icon, SparklesIcon } from "lucide-react";

import PromptModal from "@components/prompt-modal";

interface ThumbnailGeneratorProps {
    disabled?: boolean;
    status: string;
    onGenerate: (promptInput: string) => void;
}

export default function ThumbnailGenerator({ disabled, onGenerate, status }: ThumbnailGeneratorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <PromptModal
                isOpen={isModalOpen}
                title="Generate Thumbnail"
                message="Provide a descriptive prompt for the AI to generate a thumbnail"
                placeholder="Leave empty to let the AI surprise you"
                onConfirm={onGenerate}
                onCancel={() => setIsModalOpen(false)}
            />
            <button
                type="button"
                className="bg-muted border-muted-foreground flex size-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed disabled:cursor-default disabled:opacity-50"
                disabled={disabled}
                onClick={() => setIsModalOpen(true)}
            >
                {disabled ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                <p className="text-muted-foreground group-hover:group-[not-disabled]:text-foreground mt-2 h-6 text-center text-sm text-balance group-hover:group-[not-disabled]:underline">
                    {disabled ? status : "Generate using AI"}
                </p>
                {disabled ? null : (
                    <p className="text-muted-foreground/25 -mt-1 h-1 text-xs group-hover:decoration-0">
                        Limits my apply
                    </p>
                )}
            </button>
        </>
    );
}

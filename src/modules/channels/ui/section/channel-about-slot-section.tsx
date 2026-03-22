"use client";

import { Suspense, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { SimpleEditor } from "@components/tiptap-templates/simple/simple-editor";
import SimpleEditorReadOnly from "@components/tiptap-templates/simple/simple-editor-read-only";
import { Form } from "@components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { range } from "@lib/utils";
import { GridVideoCardSkeleton } from "@modules/videos/ui/components/video-cards/grid-video-card";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { Editor } from "@tiptap/core";

import InteractionMenu from "../components/interaction-menu";

interface ChannelAboutSlotSectionProps {
    userId: string;
}

export default function ChannelAboutSlotSection({ userId }: ChannelAboutSlotSectionProps) {
    return (
        <>
            <Suspense fallback={<ChannelAboutSlotSkeleton />}>
                <ErrorBoundary fallback={<p>Something went wrong</p>}>
                    <ChannelAboutSlotSectionSuspense userId={userId} />
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

const aboutSchema = z.object({
    about: z.string(),
});

type AboutSchemaType = z.infer<typeof aboutSchema>;

function ChannelAboutSlotSectionSuspense({ userId }: ChannelAboutSlotSectionProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { isLoaded, isSignedIn } = useAuth();

    const { data } = useSuspenseQuery(trpc.channels.getAbout.queryOptions({ userId }));

    const updateAbout = useMutation(
        trpc.channels.updateAbout.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.channels.getAbout.queryOptions({ userId }));
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }),
    );

    const form = useForm<AboutSchemaType>({
        resolver: zodResolver(aboutSchema),
        defaultValues: {
            about: "",
        },
    });

    const [editor, setEditor] = useState<Editor | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [dirtyContent, setDirtyContent] = useState("");

    const handleSubmit = (data: AboutSchemaType) => {
        updateAbout.mutate({
            about: editor?.getHTML() ?? "",
        });
        setIsEditing(false);
        setIsDirty(false);
        setDirtyContent("");
    };

    const onEdit = () => {
        if (isEditing && isDirty) {
            setDirtyContent(editor?.getHTML() ?? "");
        }

        setIsEditing((isEditing) => !isEditing);
    };

    const onDiscard = () => {
        setDirtyContent("");
        setIsDirty(false);
        editor?.commands.setContent(data.about ?? "");
    };

    editor?.on("update", () => {
        const currentContent = editor.getHTML();
        const initialContent = data.about ?? "";
        setIsDirty(currentContent !== initialContent);
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="isolate w-full">
                {data.about ? (
                    isEditing ? (
                        <SimpleEditor content={dirtyContent || (data.about ?? "")} onEditorReady={setEditor} />
                    ) : (
                        <SimpleEditorReadOnly content={dirtyContent || (data.about ?? "")} />
                    )
                ) : (
                    <div className="border-muted flex h-32 items-center justify-center rounded-md border">
                        <p className="text-muted-foreground text-sm">
                            {isLoaded && isSignedIn ? "You have" : "This user has"} not added an about section yet.
                        </p>
                    </div>
                )}
                {isLoaded && isSignedIn && data.isOwner && (
                    <InteractionMenu
                        onEdit={onEdit}
                        onDiscard={onDiscard}
                        isEditing={isEditing}
                        isPending={updateAbout.isPending}
                        isDirty={isDirty}
                    />
                )}
            </form>
        </Form>
    );
}

function ChannelAboutSlotSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {range(DEFAULT_INFINITE_PREFETCH_LIMIT).map((i) => (
                <div key={i}>
                    <GridVideoCardSkeleton />
                </div>
            ))}
        </div>
    );
}

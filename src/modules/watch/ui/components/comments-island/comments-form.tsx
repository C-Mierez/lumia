import { useState } from "react";

import { User2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { commentsUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@components/ui/form";
import { Skeleton } from "@components/ui/skeleton";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { cn } from "@lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentsFormProps {
    videoId: string;
    parentId?: number;
    isRoot?: boolean;
    onCancel?: () => void;
}

export type CommentsUpdateSchema = z.infer<typeof commentsUpdateSchema>;

export function CommentsForm({ videoId, isRoot = true, onCancel, parentId }: CommentsFormProps) {
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useUser();
    const clerk = useClerk();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const form = useForm<CommentsUpdateSchema>({
        resolver: zodResolver(commentsUpdateSchema),
        defaultValues: {
            videoId,
            text: "",
        },
        mode: "onChange",
    });

    const createComment = useMutation(
        trpc.watch.createComment.mutationOptions({
            async onSuccess() {
                await queryClient.invalidateQueries({
                    queryKey: trpc.watch.getManyComments.queryKey({ videoId, limit: DEFAULT_INFINITE_PREFETCH_LIMIT }),
                });
                toast.success("Comment posted");
                if (onCancel) onCancel();
            },
            onError(error) {
                if (error.data?.code === "UNAUTHORIZED") {
                    toast.error("You need to be logged in to comment");
                    clerk.openSignIn();
                }
            },
        }),
    );

    const onSubmitForm = form.handleSubmit((data) => {
        createComment.mutate({
            text: data.text!,
            parentId,
            videoId,
        });

        form.reset();
    });

    return (
        <div className="flex items-start gap-3">
            <div>
                <AvatarOrAnonymous isRoot={isRoot} userUrl={user?.imageUrl} userName={user?.fullName} />
            </div>
            <Form {...form}>
                <form
                    onSubmit={onSubmitForm}
                    className="flex flex-1 flex-col gap-2"
                    onFocus={() => setIsFocused(true)}
                    // onBlur={() => setIsFocused(false)}
                >
                    <FormField
                        name="text"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={field.value ?? undefined}
                                        placeholder="Add a comment..."
                                        className="min-h-10 resize-none text-sm"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {isFocused && (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant={"destructiveMuted"}
                                disabled={false}
                                onClick={() => {
                                    if (onCancel) onCancel();
                                    setIsFocused(false);
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isValid}>
                                {isRoot ? "Comment" : "Reply"}
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
}

interface AvatarOrAnonymousProps {
    userName?: string | null;
    userUrl?: string;
    isRoot?: boolean;
}

function AvatarOrAnonymous({ userUrl, userName, isRoot = false }: AvatarOrAnonymousProps) {
    return (
        <>
            {!!userUrl ? (
                <Avatar className={cn(isRoot ? "size-10" : "size-7")}>
                    <AvatarImage src={userUrl} alt={userName ?? "user"} />
                    <AvatarFallback>
                        <Skeleton className="rounded-full" />
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div
                    className={cn(
                        "bg-muted-foreground text-muted flex items-center justify-center rounded-full",
                        isRoot ? "size-10" : "size-7",
                    )}
                >
                    <User2Icon className={cn(isRoot ? "size-8" : "size-4")} />
                </div>
            )}
        </>
    );
}

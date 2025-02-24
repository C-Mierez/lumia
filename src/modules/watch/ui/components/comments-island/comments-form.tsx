import { useForm } from "react-hook-form";
import { z } from "zod";

import { commentsUpdateSchema } from "@/db/schema";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Form, FormControl, FormField, FormItem } from "@components/ui/form";
import { Skeleton } from "@components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { User2Icon } from "lucide-react";
import { Textarea } from "@components/ui/textarea";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentsFormProps {
    videoId: string;
}

export type CommentsUpdateSchema = z.infer<typeof commentsUpdateSchema>;

export function CommentsForm({ videoId }: CommentsFormProps) {
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
                await queryClient.invalidateQueries({ queryKey: trpc.watch.getManyComments.queryKey({ videoId }) });
                toast.success("Comment posted");
            },
            onError(error) {
                if (error.data?.code === "UNAUTHORIZED") {
                    toast.error("You need to be logged in to comment");
                    clerk.openSignIn();
                }
            },
        }),
    );

    const onSubmit = form.handleSubmit((data) => {
        createComment.mutate({
            text: data.text!,
            videoId,
        });

        form.reset();
    });

    return (
        <div className="flex items-start gap-3">
            <div>
                <AvatarOrAnonymous userUrl={user?.imageUrl} userName={user?.fullName} />
            </div>
            <Form {...form}>
                <form
                    onSubmit={onSubmit}
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
                                    setIsFocused(false);
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isValid}>
                                Comment
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
}

function AvatarOrAnonymous({ userUrl, userName }: AvatarOrAnonymousProps) {
    return (
        <>
            {!!userUrl ? (
                <Avatar className="size-10">
                    <AvatarImage src={userUrl} alt={userName ?? "user"} />
                    <AvatarFallback>
                        <Skeleton className="rounded-full" />
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="bg-muted-foreground text-muted flex size-10 items-center justify-center rounded-full">
                    <User2Icon className="size-8" />
                </div>
            )}
        </>
    );
}

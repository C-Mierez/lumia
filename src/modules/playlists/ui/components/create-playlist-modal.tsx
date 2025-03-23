import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { playlistInsertSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import ResponsiveModal from "@components/responsive-modal";
import { Button } from "@components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalProps } from "@hooks/use-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreatePlaylistModalProps extends ModalProps {
    onConfirm?: () => void;
    onClose?: () => void;
}

export default function CreatePlaylistModal(props: CreatePlaylistModalProps) {
    const { onOpenChange, onClose, onConfirm } = props;

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createPlaylist = useMutation(
        trpc.playlists.createPlaylist.mutationOptions({
            onMutate: async () => {
                toast.info("Creating playlist...");
            },
            async onSuccess(data) {
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.listPlaylistsForVideo.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.getManyPlaylists.queryKey() });
                await queryClient.invalidateQueries({
                    queryKey: trpc.playlists.getOnePlaylist.queryKey({ playlistId: data.id }),
                });
                toast.success("Playlist created");
            },
            onError() {
                toast.error("Failed to create playlist");
            },
        }),
    );

    const form = useForm<z.infer<typeof playlistInsertSchema>>({
        resolver: zodResolver(playlistInsertSchema),
        defaultValues: {
            name: undefined,
            description: undefined,
        },
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
            onClose?.();
        }
        onOpenChange(isOpen);
    };

    return (
        <ResponsiveModal {...props} onOpenChange={handleOpenChange} hideClose className="m-0 p-0">
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // the void is for eslint because `handleSubmit` returns a promise.
                        void form.handleSubmit((data) => {
                            createPlaylist.mutate(data);
                            onConfirm?.();
                            handleOpenChange(false);
                        })(e);
                    }}
                    className="flex flex-col gap-4 p-4"
                >
                    <div className="text-start text-balance">
                        <h2 className="flex justify-between text-xl font-bold">New playlist</h2>
                    </div>
                    {/* <Separator /> */}

                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground text-sm">Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={"Identify your playlist"} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground text-sm">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder={"Explain what the playlist is about (optional)"}
                                        className="resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button variant={"secondary"}>Create</Button>
                        <Button
                            type="button"
                            variant={"muted"}
                            onClick={() => {
                                handleOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
}

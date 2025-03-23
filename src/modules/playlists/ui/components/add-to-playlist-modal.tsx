"use client";

import { CheckSquareIcon, Loader2Icon, PlusIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import ResponsiveModal from "@components/responsive-modal";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import useModal, { ModalProps } from "@hooks/use-modal";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CreatePlaylistModal from "./create-playlist-modal";

interface AddToPlaylistModalProps extends ModalProps {
    onCancel?: () => void;
    videoId: string;
}

export default function AddToPlaylistModal(props: AddToPlaylistModalProps) {
    const { onOpenChange, onCancel, videoId } = props;

    const { isSignedIn } = useAuth();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const { data: playlists, isLoading } = useQuery(
        trpc.playlists.listPlaylistsForVideo.queryOptions(
            isSignedIn
                ? {
                      videoId,
                  }
                : skipToken,
        ),
    );

    const addToPlaylist = useMutation(
        trpc.playlists.toggleVideo.mutationOptions({
            onMutate: async () => {
                toast.info("Updating playlist...");
            },
            async onSuccess(data) {
                if (!data) return;
                toast.success(`Video ${data.didAdd ? "added to" : "removed from"} playlist`);
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.listPlaylistsForVideo.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.getManyPlaylists.queryKey() });
                await queryClient.invalidateQueries({
                    queryKey: trpc.playlists.getVideos.queryKey({
                        playlistId: data.result.playlistId,
                        limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
                    }),
                });
            },
            onError() {
                toast.error("Failed to update playlist");
            },
        }),
    );

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            onCancel?.();
        }
        onOpenChange(isOpen);
    };

    const newPlaylistModal = useModal({});

    return (
        <>
            {newPlaylistModal.isOpen && <CreatePlaylistModal {...newPlaylistModal} />}
            <ResponsiveModal {...props} onOpenChange={handleOpenChange} className="m-0 p-0">
                <div className="flex flex-col gap-4 p-4">
                    <div className="text-start text-balance">
                        <h2 className="flex justify-between text-xl font-bold">Save video to...</h2>
                    </div>
                    {/* <Separator /> */}

                    <div className="grid auto-rows-fr grid-cols-1 gap-4">
                        {playlists?.map((playlist) => {
                            const isAlreadyAdded = !!playlist.hasVideo;
                            return (
                                <Button
                                    key={playlist.id}
                                    variant={isAlreadyAdded ? "secondary" : "muted"}
                                    className="flex items-center gap-2"
                                    disabled={addToPlaylist.isPending}
                                    onClick={() => {
                                        addToPlaylist.mutate({
                                            playlistId: playlist.id,
                                            videoId,
                                        });
                                    }}
                                >
                                    <span className="line-clamp-1 flex-1 text-start">{playlist.name}</span>
                                    <p className="line-clamp-1 text-xs">{playlist.videosCount} videos</p>
                                    <Separator orientation="vertical" />

                                    {isAlreadyAdded ? <CheckSquareIcon /> : <SquareIcon />}
                                </Button>
                            );
                        })}
                        {isLoading && (
                            <div className="mx-auto">
                                <Loader2Icon className="text-muted-foreground animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant={"secondary"} onClick={newPlaylistModal.openModal}>
                            <PlusIcon className="-m-1" />
                            New Playlist
                        </Button>
                        <Button type="button" variant={"muted"} onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </>
    );
}

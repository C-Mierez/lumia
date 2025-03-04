"use client";

import { formatDistanceToNow } from "date-fns";
import { ListVideo, PlayIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { PlaylistsGetManyOutput } from "@/trpc/types";
import { DEFAULT_INFINITE_PREFETCH_LIMIT } from "@lib/constants";
import { getFullPlaylistUrl } from "@lib/utils";
import VideoThumbnail from "@modules/videos/ui/components/video-thumbnail";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import PlaylistMenu from "../playlist-menu";

interface PlaylistCardProps {
    playlist: PlaylistsGetManyOutput["items"][0];
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const deletePlaylist = useMutation(
        trpc.playlists.deletePlaylist.mutationOptions({
            onMutate() {
                toast.info("Deleting playlist...");
            },
            async onSuccess() {
                toast.success("Playlist deleted");
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.getManyPlaylists.queryKey() });
                await queryClient.invalidateQueries({ queryKey: trpc.playlists.listPlaylistsForVideo.queryKey() });
                await queryClient.invalidateQueries({
                    queryKey: trpc.playlists.getVideos.queryKey({
                        playlistId: playlist.id,
                        limit: DEFAULT_INFINITE_PREFETCH_LIMIT,
                    }),
                });
            },
            onError() {
                toast.error("Failed to delete playlist");
            },
        }),
    );

    const onDestructive = () => {
        deletePlaylist.mutate({ id: playlist.id });
    };

    return (
        <div className="group/playlist relative flex max-h-full max-w-full flex-col gap-2">
            <div className="relative aspect-video rounded-md">
                {playlist.videosCount === 0 && (
                    <div className="playlistCard bg-background-alt relative grid aspect-video place-items-center rounded-md p-2">
                        <p className="text-muted-foreground">This playlist is empty</p>
                    </div>
                )}
                {playlist.video && playlist.videosCount > 0 && (
                    <>
                        <div className="playlistCard">
                            <VideoThumbnail
                                title={playlist.name}
                                imageUrl={playlist.video.thumbnailUrl}
                                previewUrl={playlist.video.previewUrl}
                                duration={0}
                            />
                        </div>
                        <div className="bg-background/50 absolute right-0 bottom-0 flex items-center gap-1 rounded-tl-md rounded-bl-md p-1 pl-2 text-xs">
                            <ListVideo className="size-3" />
                            <span>
                                {Intl.NumberFormat("en", {
                                    notation: "compact",
                                }).format(playlist.videosCount)}{" "}
                                Videos
                            </span>
                        </div>
                        <div className="bg-background/90 absolute -inset-0.5 grid place-items-center rounded-md opacity-0 transition-opacity group-hover/playlist:opacity-100">
                            <div className="flex items-center gap-1">
                                <PlayIcon className="size-4" />
                                <span>View Playlist</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-1 flex-col">
                    <div className="text-brand line-clamp-1 text-start font-bold lg:text-base">{playlist.name}</div>

                    <p className="text-muted-foreground line-clamp-1 text-sm">
                        <span>Updated {formatDistanceToNow(playlist.updatedAt, { addSuffix: true })}</span>
                    </p>
                </div>
                <div className="z-50 size-min">
                    <PlaylistMenu playlistId={playlist.id} onDestructive={onDestructive} />
                </div>
            </div>
            <Link href={getFullPlaylistUrl(playlist.id)} className="absolute inset-0" />
        </div>
    );
}

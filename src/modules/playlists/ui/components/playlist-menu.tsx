"use client";
import { useState } from "react";

import { EditIcon, MoreVerticalIcon, Share2Icon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PlaylistsGetManyOutput } from "@/trpc/types";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { getFullPlaylistUrl } from "@lib/utils";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";

import EditPlaylistModal from "./edit-playlist-modal";

interface PlaylistMenuProps {
    playlist: PlaylistsGetManyOutput["items"][0];
    onDestructive?: () => void;
}

export default function PlaylistMenu({ playlist, onDestructive }: PlaylistMenuProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const onShare = () => {
        toast.promise(window.navigator.clipboard.writeText(getFullPlaylistUrl(playlist.id)), {
            loading: "Copying link...",
            success: "Link copied to clipboard",
            error: "Failed to copy link",
        });
    };

    return (
        <>
            <EditPlaylistModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                }}
                onConfirm={() => {
                    setIsEditModalOpen(false);
                }}
                defaultData={{ name: playlist.name, description: playlist.description ?? "" }}
            />

            <DropdownMenu modal>
                <DropdownMenuTrigger asChild>
                    <Button size={"smallIcon"} variant={"ghost"}>
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={onShare}>
                            <Share2Icon />
                            <span>Share</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                        <Separator />

                        <DropdownMenuItem
                            onClick={() => {
                                setIsEditModalOpen(true);
                            }}
                        >
                            <EditIcon />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        {!!onDestructive && (
                            <>
                                <DropdownMenuItem variant="destructive" onClick={onDestructive}>
                                    <Trash2 />
                                    <span>Remove</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

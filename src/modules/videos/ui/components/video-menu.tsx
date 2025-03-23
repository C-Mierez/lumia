"use client";
import { useState } from "react";

import { BookmarkIcon, ClockIcon, MoreVerticalIcon, Share2Icon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { getFullVideoUrl } from "@lib/utils";
import AddToPlaylistModal from "@modules/playlists/ui/components/add-to-playlist-modal";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import useModal from "@hooks/use-modal";

interface VideoMenuProps {
    videoId: string;
    onDestructive?: () => void;
}

export default function VideoMenu({ videoId, onDestructive }: VideoMenuProps) {
    const { isSignedIn } = useAuth();
    const { openSignIn } = useClerk();

    const onShare = () => {
        toast.promise(window.navigator.clipboard.writeText(getFullVideoUrl(videoId)), {
            loading: "Copying link...",
            success: "Link copied to clipboard",
            error: "Failed to copy link",
        });
    };

    const addToPlaylistModal = useModal({});

    return (
        <>
            {addToPlaylistModal.isOpen && <AddToPlaylistModal {...addToPlaylistModal} videoId={videoId} />}
            <DropdownMenu modal>
                <DropdownMenuTrigger asChild>
                    <Button variant={"outlineLight"} className="aspect-square size-10 border">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="border-muted-foreground/25 border"
                    align="end"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => {}}>
                            <ClockIcon />
                            <span>Watch Later</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                if (!isSignedIn) {
                                    openSignIn();
                                    return;
                                }

                                e.stopPropagation();
                                e.preventDefault();
                                addToPlaylistModal.openModal();
                            }}
                        >
                            <BookmarkIcon />
                            <span>Save to Playlist</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={onShare}>
                            <Share2Icon />
                            <span>Share</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {!!onDestructive && (
                        <>
                            <Separator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem variant="destructive" onClick={onDestructive}>
                                    <Trash2 />
                                    <span>Remove</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

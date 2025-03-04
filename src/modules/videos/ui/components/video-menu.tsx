"use client";
import { useState } from "react";

import { BookmarkIcon, ClockIcon, MoreVerticalIcon, Share2Icon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { getFullVideoUrl } from "@lib/utils";
import AddToPlaylistModal from "@modules/playlists/ui/components/add-to-playlist-modal";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";

interface VideoMenuProps {
    videoId: string;
    onDestructive?: () => void;
}

export default function VideoMenu({ videoId, onDestructive }: VideoMenuProps) {
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);

    const { isSignedIn } = useAuth();

    const onShare = () => {
        toast.promise(window.navigator.clipboard.writeText(getFullVideoUrl(videoId)), {
            loading: "Copying link...",
            success: "Link copied to clipboard",
            error: "Failed to copy link",
        });
    };

    return (
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
                                toast.error("You need to be signed in to save to a playlist");
                                return;
                            }

                            e.stopPropagation();
                            e.preventDefault();
                            setIsAddToPlaylistModalOpen(true);
                        }}
                    >
                        <BookmarkIcon />
                        <span>Save to Playlist</span>
                    </DropdownMenuItem>
                    <AddToPlaylistModal
                        videoId={videoId}
                        isOpen={isAddToPlaylistModalOpen}
                        onCancel={() => {
                            setIsAddToPlaylistModalOpen(false);
                        }}
                    />
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
    );
}

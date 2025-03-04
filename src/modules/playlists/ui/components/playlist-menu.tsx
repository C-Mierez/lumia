"use client";
import { MoreVerticalIcon, Share2Icon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { getFullPlaylistUrl } from "@lib/utils";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";

interface PlaylistMenuProps {
    playlistId: string;
    onDestructive?: () => void;
}

export default function PlaylistMenu({ playlistId, onDestructive }: PlaylistMenuProps) {
    const onShare = () => {
        toast.promise(window.navigator.clipboard.writeText(getFullPlaylistUrl(playlistId)), {
            loading: "Copying link...",
            success: "Link copied to clipboard",
            error: "Failed to copy link",
        });
    };

    return (
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

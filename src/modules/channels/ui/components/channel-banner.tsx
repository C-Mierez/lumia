import { Edit2Icon } from "lucide-react";
import Image from "next/image";

import { ChannelsGetOneOutput } from "@/trpc/types";
import { Button } from "@components/ui/button";
import useModal from "@hooks/use-modal";

import EditBannerModal from "./edit-banner-modal";
import { Skeleton } from "@components/ui/skeleton";

interface ChannelBannerProps {
    channel: ChannelsGetOneOutput;
}

export default function ChannelBanner({ channel }: ChannelBannerProps) {
    const editBannerModal = useModal({});

    return (
        <div className="relative aspect-[6.2] w-full overflow-hidden rounded-md">
            {channel.bannerUrl ? (
                <Image src={channel.bannerUrl} fill alt={"Banner"} />
            ) : (
                <div className="bg-background-alt grid size-full place-items-center" />
            )}
            {channel.isOwner !== null && channel.isOwner && (
                <div className="absolute right-4 bottom-4">
                    <EditBannerModal {...editBannerModal} userId={channel.id} />
                    <Button size={"sm"} onClick={editBannerModal.openModal}>
                        <Edit2Icon /> Edit
                    </Button>
                </div>
            )}
        </div>
    );
}

export function ChannelBannerSkeleton() {
    return <Skeleton className="bg-background-alt aspect-[6.2] w-full rounded-md" />;
}

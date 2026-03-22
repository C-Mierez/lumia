import { HydrateClient } from "@/trpc/server";
import { SEARCH_PARAMS } from "@lib/searchParams";
import ChannelAboutSlotView from "@modules/channels/ui/views/channel-about-slot-view";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
    searchParams: Promise<SEARCH_PARAMS["Home"]>;
}

export default async function ChannelPage({ searchParams }: ChannelPageProps) {
    const { u } = await searchParams;

    return (
        <HydrateClient>
            <ChannelAboutSlotView userId={u!} />
        </HydrateClient>
    );
}

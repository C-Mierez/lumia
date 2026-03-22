import ChannelAboutSlotSection from "../section/channel-about-slot-section";

interface ChannelAboutSlotViewProps {
    userId: string;
}

export default function ChannelAboutSlotView({ userId }: ChannelAboutSlotViewProps) {
    return (
        <>
            <ChannelAboutSlotSection userId={userId} />
        </>
    );
}

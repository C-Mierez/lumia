import BasicTooltip from "@components/basic-tooltip";

interface UserNameProps {
    name: string;
}

export default function UserName({ name }: UserNameProps) {
    return (
        <BasicTooltip label={name} contentProps={{ side: "top" }}>
            <div className="text-foreground text-base leading-4 font-semibold">{name}</div>
        </BasicTooltip>
    );
}

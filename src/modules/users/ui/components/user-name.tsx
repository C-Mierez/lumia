import BasicTooltip from "@components/basic-tooltip";
import { cn } from "@lib/utils";

interface UserNameProps {
    name: string;
    className?: string;
}

export default function UserName({ name, className }: UserNameProps) {
    return (
        <BasicTooltip label={name} contentProps={{ side: "top" }}>
            <div className={cn("text-foreground line-clamp-1 w-fit text-base leading-4 font-semibold", className)}>
                {name}
            </div>
        </BasicTooltip>
    );
}

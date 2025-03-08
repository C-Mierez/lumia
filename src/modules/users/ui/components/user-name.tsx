import Link from "next/link";

import BasicTooltip from "@components/basic-tooltip";
import { cn, getFullChannelUrl } from "@lib/utils";

interface UserNameProps {
    name: string;
    userId: string;
    className?: string;
}

export default function UserName({ name, userId, className }: UserNameProps) {
    return (
        <BasicTooltip label={name} contentProps={{ side: "top" }}>
            <Link
                href={getFullChannelUrl(userId)}
                className={cn("text-foreground line-clamp-1 w-fit text-base leading-4 font-semibold", className)}
            >
                {name}
            </Link>
        </BasicTooltip>
    );
}

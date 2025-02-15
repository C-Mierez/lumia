import { useState } from "react";

import { Check, CopyIcon } from "lucide-react";

import { cn } from "@lib/utils";

import { Button } from "./ui/button";

interface CopyToClipboardButtonProps {
    targetContent: string;
    className?: string;
    disabled: boolean;
}

export default function CopyToClipboardButton({ targetContent, disabled, className }: CopyToClipboardButtonProps) {
    const [didCopy, setDidCopy] = useState(false);

    const onClick = () => {
        setDidCopy(true);
        navigator.clipboard.writeText(targetContent).then(() => {
            setDidCopy(false);
        });
    };

    return (
        <Button
            variant={"ghost"}
            size={"icon"}
            type="button"
            className={cn("shrink-0", className)}
            disabled={disabled || didCopy}
            onClick={onClick}
        >
            {didCopy ? <Check /> : <CopyIcon />}
        </Button>
    );
}

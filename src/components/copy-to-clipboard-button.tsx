import { useState } from "react";

import { Check, CopyIcon } from "lucide-react";

import { cn } from "@lib/utils";

import { Button } from "./ui/button";
import { toast } from "sonner";

interface CopyToClipboardButtonProps {
    targetContent: string;
    className?: string;
    disabled: boolean;
}

export default function CopyToClipboardButton({ targetContent, disabled, className }: CopyToClipboardButtonProps) {
    const [didCopy, setDidCopy] = useState(false);

    const onClick = () => {
        setDidCopy(true);
        const didCopy = navigator.clipboard.writeText(targetContent);

        didCopy.then(() => {
            toast.success("Copied to clipboard");
        });

        didCopy.catch(() => {
            toast.error("Failed to copy to clipboard");
        });

        setTimeout(() => {
            setDidCopy(false);
        }, 2000);
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

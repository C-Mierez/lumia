import { SparklesIcon } from "lucide-react";

import BasicTooltip from "@components/basic-tooltip";
import { Button } from "@components/ui/button";

interface GenWithAIButtonProps {
    disabled: boolean;
    status: string;
    tooltip: string;
    onClick: () => void;
}

export function GenWithAIButton({ disabled, status, tooltip, onClick }: GenWithAIButtonProps) {
    return (
        <div className="flex items-center gap-2">
            {!!status && <span className="text-muted-foreground text-xs">{status}</span>}
            <BasicTooltip label={tooltip}>
                <Button type="button" variant={"muted"} size={"smallIcon"} disabled={disabled} onClick={onClick}>
                    <SparklesIcon />
                    {/* Generate */}
                </Button>
            </BasicTooltip>
        </div>
    );
}

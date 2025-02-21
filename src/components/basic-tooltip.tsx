import { cn } from "@lib/utils";
import { TooltipContentProps } from "@radix-ui/react-tooltip";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface BasicTooltipProps {
    className?: string;
    content?: React.ReactNode;
    contentProps?: TooltipContentProps;
    label?: string;
    children: React.ReactNode;
}

export default function BasicTooltip({ content, contentProps, label, className, children }: BasicTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent {...contentProps} side={contentProps?.side ?? "left"}>
                    {/* Use label if provided */}
                    {label && <span className={cn("text-muted block text-xs font-medium", className)}>{label}</span>}
                    {/* Otherwise use content component */}
                    {!label && content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

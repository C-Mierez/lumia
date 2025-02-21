import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
    "inline-flex items-center gap-x-2.5 rounded-md text-sm bg-background px-2.5 py-1.5 border",
    {
        variants: {
            status: {
                success: "",
                error: "",
                inProgress: "",
                default: "",
            },
        },
        defaultVariants: {
            status: "default",
        },
    },
);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    leftLabel: string;
    rightLabel: string;
}

export function StatusBadge({
    className,
    status,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    leftLabel,
    rightLabel,
    ...props
}: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
                {LeftIcon && (
                    <LeftIcon
                        className={cn(
                            "-ml-0.5 size-3 shrink-0",
                            status === "inProgress" && "animate-spin text-amber-400",
                            status === "success" && "text-emerald-500",
                            status === "error" && "text-destructive",
                        )}
                        aria-hidden={true}
                    />
                )}
                {leftLabel}
            </span>
            <span className="bg-border h-4 w-px" />
            <span className="text-foreground inline-flex items-center gap-1.5 text-xs">
                {RightIcon && <RightIcon className="-ml-0.5 size-3 shrink-0" aria-hidden={true} />}
                {rightLabel}
            </span>
        </span>
    );
}

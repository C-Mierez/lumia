import { Button } from "@components/ui/button";

interface SubscribeButtonProps {
    onClick: React.ComponentProps<typeof Button>["onClick"];
    disabled: boolean;
    isSubscribed: boolean;
    className?: string;
    size: React.ComponentProps<typeof Button>["size"];
}

export function SubscribeButton({ onClick, disabled, isSubscribed, className, size }: SubscribeButtonProps) {
    return (
        <Button
            className={className}
            onClick={onClick}
            disabled={disabled}
            size={size}
            variant={isSubscribed ? "muted" : "secondary"}
        >
            {isSubscribed ? "Subscribed" : "Subscribe"}
        </Button>
    );
}

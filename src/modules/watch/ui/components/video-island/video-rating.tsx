import { Button } from "@components/ui/button";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

interface VideoRatingProps {}

export function VideoRating({}: VideoRatingProps) {
    return (
        <div>
            <Button size={"lg"} className="rounded-r-none border" variant={"outlineLight"}>
                <ThumbsUpIcon />
                <span className="text-xs">283</span>
            </Button>
            <Button
                size={"lg"}
                className="hover:bg-destructive border-l-none rounded-l-none border"
                variant={"outlineLight"}
            >
                <ThumbsDownIcon />
                <span className="text-xs">7</span>
            </Button>
        </div>
    );
}

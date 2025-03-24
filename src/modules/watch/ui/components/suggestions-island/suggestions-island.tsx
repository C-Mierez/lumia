import { SuggestionsGetManyOutput } from "@/trpc/types";
import { getFullVideoUrl } from "@lib/utils";
import { HorizontalVideoCard } from "@modules/videos/ui/components/video-cards/horizontal-video-card";

interface SuggestionsIslandProps {
    videoId: string;
    suggestions: SuggestionsGetManyOutput["items"];
}

export default function SuggestionsIsland({ videoId, suggestions }: SuggestionsIslandProps) {
    return (
        <div className="flex flex-col gap-4 px-4 md:px-0">
            <h2 className="font-brand text-md">You might also like...</h2>
            <div className="flex flex-col gap-4">
                {suggestions.map((suggestion) => (
                    <HorizontalVideoCard key={suggestion.id} video={suggestion} href={getFullVideoUrl(suggestion.id)} />
                ))}
                {suggestions.length === 0 && (
                    <p className="text-muted-foreground mx-auto text-center text-xs">No suggestions found</p>
                )}
            </div>
        </div>
    );
}

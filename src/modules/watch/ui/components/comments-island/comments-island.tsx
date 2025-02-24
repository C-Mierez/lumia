import { WatchGetManyCommentsOutput, WatchGetManyCommentsQuery } from "@/trpc/types";
import { CommentsForm } from "./comments-form";
import { CommentsList } from "./comments-list";

interface CommentsIslandProps {
    videoId: string;
    comments: WatchGetManyCommentsOutput["comments"];
    query: WatchGetManyCommentsQuery;
}

export function CommentsIsland({ videoId, comments, query }: CommentsIslandProps) {
    const totalCommentsAmount = comments.length === 0 ? "0" : comments[0].totalComments;

    return (
        <div className="flex flex-col gap-4">
            <div className="font-brand text-xl">{totalCommentsAmount} Comments</div>
            <CommentsForm videoId={videoId} />
            <CommentsList comments={comments} query={query} />
        </div>
    );
}

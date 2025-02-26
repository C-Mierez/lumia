import { categoriesRouter } from "@modules/categories/server/procedures";
import { studioRouter } from "@modules/studio/server/procedures";
import { subscriptionsRouter } from "@modules/subscriptions/server/procedures";
import { suggestionsRouter } from "@modules/suggestions/server/procedures";
import { videosRouter } from "@modules/videos/server/procedures";
import { watchRouter } from "@modules/watch/server/procedures";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
    studio: studioRouter,
    videos: videosRouter,
    categories: categoriesRouter,
    watch: watchRouter,
    subscriptions: subscriptionsRouter,
    suggestions: suggestionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

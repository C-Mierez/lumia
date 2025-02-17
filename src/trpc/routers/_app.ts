import { categoriesRouter } from "@modules/categories/server/procedures";
import { studioRouter } from "@modules/studio/server/procedures";

import { createTRPCRouter } from "../init";
import { videosRouter } from "@modules/videos/server/procedures";
import { testRouter } from "@modules/home/server/procedures";

export const appRouter = createTRPCRouter({
    studio: studioRouter,
    videos: videosRouter,
    categories: categoriesRouter,
    test: testRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

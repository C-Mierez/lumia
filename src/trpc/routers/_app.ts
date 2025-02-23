import { categoriesRouter } from "@modules/categories/server/procedures";
import { studioRouter } from "@modules/studio/server/procedures";
import { videosRouter } from "@modules/videos/server/procedures";
import { watchRouter } from "@modules/watch/server/procedures";

import { createTRPCRouter } from "../init";
import { usersRouter } from "@modules/users/server/procedures";

export const appRouter = createTRPCRouter({
    studio: studioRouter,
    videos: videosRouter,
    categories: categoriesRouter,
    watch: watchRouter,
    users: usersRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "./routers/_app";

export type RouterOutput = inferRouterOutputs<AppRouter>;

export type StudioGetOneOutput = RouterOutput["studio"]["getOne"];

import { UseSuspenseQueryResult } from "@tanstack/react-query";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "./routers/_app";

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export type StudioGetOneOutput = RouterOutput["studio"]["getOne"];
export type StudioGetOneQuery = UseSuspenseQueryResult<StudioGetOneOutput, unknown>;

export type WatchGetOneOutput = RouterOutput["watch"]["getOne"];
export type WatchGetOneQuery = UseSuspenseQueryResult<WatchGetOneOutput, unknown>;

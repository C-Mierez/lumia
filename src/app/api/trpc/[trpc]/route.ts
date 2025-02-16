import { NextRequest } from "next/server";

import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createContext(req),
    });
export { handler as GET, handler as POST };

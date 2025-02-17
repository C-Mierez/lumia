import { env } from "@/env";
import Mux from "@mux/mux-node";

export const mux = new Mux({
    tokenId: env.MUX_TOKEN_ID,
    tokenSecret: env.MUX_TOKEN_SECRET,
});

import { app } from "../../src/server/app";
import { handle } from "hono/cloudflare-pages";

export const onRequest = handle(app);

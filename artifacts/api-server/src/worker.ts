/**
 * Cloudflare Workers entry point.
 * Hono apps expose a fetch handler that is directly compatible with the
 * Workers runtime — no extra adapter needed.
 */
import app from "./app";

export default app;

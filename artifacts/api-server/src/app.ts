import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import router from "./routes";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());
app.route("/", router);

export default app;

import { Hono } from "hono";
import { HealthCheckResponse } from "@workspace/api-zod";

const app = new Hono();

app.get("/healthz", (c) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  return c.json(data);
});

export default app;

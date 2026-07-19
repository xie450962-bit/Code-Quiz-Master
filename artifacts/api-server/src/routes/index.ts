import { Hono } from "hono";
import healthRouter from "./health";

const router = new Hono();

router.route("/", healthRouter);

export default router;

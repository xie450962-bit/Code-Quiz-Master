import { Hono } from "hono";
import healthRouter from "./health";
import gameResultsRouter from "./game-results";

const router = new Hono();

router.route("/", healthRouter);
router.route("/", gameResultsRouter);

export default router;

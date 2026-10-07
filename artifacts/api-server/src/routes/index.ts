import { Hono } from "hono";
import healthRouter from "./health";
import gameResultsRouter from "./game-results";
import gameContentRouter from "./game-content";

const router = new Hono();

router.route("/", healthRouter);
router.route("/", gameResultsRouter);
router.route("/", gameContentRouter);

export default router;

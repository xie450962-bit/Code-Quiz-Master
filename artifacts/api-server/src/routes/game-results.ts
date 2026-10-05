import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { compareGameResults, getDatabase, gameResults } from "@workspace/db";
import { validateResult, type ResultInput } from "../gameResultValidation";

type Bindings = {
  DATABASE_URL?: string;
  HYPERDRIVE?: { connectionString: string };
};

const router = new Hono<{ Bindings: Bindings }>();

router.post("/game-results", async (c) => {
  let input: unknown;
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "Request body must be valid JSON." }, 400);
  }
  if (!validateResult(input)) return c.json({ error: "Invalid game result." }, 400);

  const connectionString = c.env?.HYPERDRIVE?.connectionString
    ?? c.env?.DATABASE_URL
    ?? process.env.DATABASE_URL;
  if (!connectionString) return c.json({ error: "Result storage is not configured." }, 503);

  try {
    const db = getDatabase(connectionString);
    const [current] = await db.insert(gameResults).values({
      userId: input.userId,
      gameType: input.gameType,
      wpm: input.gameType === "typing" ? input.wpm! : null,
      accuracy: input.accuracy,
      errors: input.gameType === "typing" ? input.errors! : null,
      score: input.score,
      totalQuestions: input.gameType === "typing" ? null : input.totalQuestions!,
      correctAnswers: input.gameType === "typing" ? null : input.correctAnswers!,
    }).returning();
    const history = await db.select().from(gameResults)
      .where(and(eq(gameResults.userId, input.userId), eq(gameResults.gameType, input.gameType)))
      .orderBy(desc(gameResults.playedAt), desc(gameResults.id));
    const { previous, best } = compareGameResults(history, current);
    return c.json({ current, previous, best });
  } catch (error) {
    console.error("Could not save game result", error);
    return c.json({ error: "Could not save game result." }, 500);
  }
});

export default router;

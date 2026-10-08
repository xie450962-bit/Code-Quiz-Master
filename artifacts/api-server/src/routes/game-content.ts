import { Hono } from "hono";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDatabase, getWorkerDatabase, quizQuestions, typingPrompts } from "@workspace/db";

type Bindings = { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } };
const router = new Hono<{ Bindings: Bindings }>();

function databaseUrl(c: { env?: Bindings }): string | undefined {
  return c.env?.HYPERDRIVE?.connectionString ?? c.env?.DATABASE_URL ?? process.env.DATABASE_URL;
}

router.get("/game-content/options", async (c) => {
  const url = databaseUrl(c);
  if (!url) return c.json({ error: "Content storage is not configured." }, 503);
  try {
    const db = c.env?.HYPERDRIVE ? (await getWorkerDatabase(url)).db : getDatabase(url);
    const [typing, quizzes] = await Promise.all([
      db.selectDistinct({ category: typingPrompts.category }).from(typingPrompts).where(eq(typingPrompts.active, 1)).orderBy(asc(typingPrompts.category)),
      db.selectDistinct({ gameType: quizQuestions.gameType, difficulty: quizQuestions.difficulty }).from(quizQuestions).where(eq(quizQuestions.active, 1)).orderBy(asc(quizQuestions.gameType), asc(quizQuestions.difficulty)),
    ]);
    return c.json({ typingCategories: typing.map((item) => item.category), quizDifficulties: quizzes });
  } catch (error) {
    console.error("Could not load game content options", error);
    return c.json({ error: "Could not load game content options." }, 500);
  }
});

router.get("/game-content/typing", async (c) => {
  const category = c.req.query("category");
  if (!category) return c.json({ error: "category is required." }, 400);
  const url = databaseUrl(c);
  if (!url) return c.json({ error: "Content storage is not configured." }, 503);
  try {
    const db = c.env?.HYPERDRIVE ? (await getWorkerDatabase(url)).db : getDatabase(url);
    const prompts = await db.select({ id: typingPrompts.id, category: typingPrompts.category, text: typingPrompts.text })
      .from(typingPrompts).where(and(eq(typingPrompts.category, category), eq(typingPrompts.active, 1))).orderBy(sql`random()`).limit(20);
    if (!prompts.length) return c.json({ error: "No typing prompts found for this category." }, 404);
    return c.json({ prompts });
  } catch (error) {
    console.error("Could not load typing prompts", error);
    return c.json({ error: "Could not load typing prompts." }, 500);
  }
});

router.get("/game-content/quizzes", async (c) => {
  const gameType = c.req.query("gameType");
  const difficulty = c.req.query("difficulty");
  if (!["sql", "linux"].includes(gameType ?? "") || !difficulty) return c.json({ error: "gameType and difficulty are required." }, 400);
  const url = databaseUrl(c);
  if (!url) return c.json({ error: "Content storage is not configured." }, 503);
  try {
    const db = c.env?.HYPERDRIVE ? (await getWorkerDatabase(url)).db : getDatabase(url);
    const questions = await db.select({ id: quizQuestions.id, question: quizQuestions.question, options: quizQuestions.options, correct: quizQuestions.correct })
      .from(quizQuestions).where(and(eq(quizQuestions.gameType, gameType!), eq(quizQuestions.difficulty, difficulty), eq(quizQuestions.active, 1)))
      .orderBy(sql`random()`).limit(10);
    if (!questions.length) return c.json({ error: "No quiz questions found for this selection." }, 404);
    return c.json({ questions });
  } catch (error) {
    console.error("Could not load quiz questions", error);
    return c.json({ error: "Could not load quiz questions." }, 500);
  }
});

export default router;

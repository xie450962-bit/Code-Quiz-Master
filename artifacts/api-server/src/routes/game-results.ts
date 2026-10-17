import { Hono, type MiddlewareHandler } from "hono";
import { and, asc, desc, eq } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { compareGameResults, getDatabase, getWorkerDatabase, gameResults, userProfiles } from "@workspace/db";
import { validateResult, type ResultInput } from "../gameResultValidation";

type Bindings = {
  DATABASE_URL?: string;
  NEON_AUTH_BASE_URL?: string;
  HYPERDRIVE?: { connectionString: string };
};
type Variables = { authUser: { id: string; name?: string; email?: string } };

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function describeDatabaseError(error: unknown) {
  const errors: Array<Record<string, unknown>> = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.has(current) && errors.length < 5) {
    seen.add(current);
    const value = current as Record<string, unknown>;
    const details: Record<string, unknown> = {};
    for (const key of ["name", "message", "code", "detail", "hint", "schema", "table", "column", "constraint", "routine"]) {
      if (typeof value[key] === "string" || typeof value[key] === "number") details[key] = value[key];
    }
    errors.push(details);
    current = value.cause;
  }

  return errors;
}

function getJwks(authBaseUrl: string) {
  const jwksUrl = `${authBaseUrl.replace(/\/+$/, "")}/.well-known/jwks.json`;
  let jwks = jwksByUrl.get(jwksUrl);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
    jwksByUrl.set(jwksUrl, jwks);
  }
  return jwks;
}

const requireAuth: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> = async (c, next) => {
  const authBaseUrl = c.env?.NEON_AUTH_BASE_URL ?? process.env.NEON_AUTH_BASE_URL;
  if (!authBaseUrl) return c.json({ error: "Authentication is not configured." }, 503);
  const authorization = c.req.header("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return c.json({ error: "Authentication required." }, 401);

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, getJwks(authBaseUrl), { issuer: new URL(authBaseUrl).origin }));
  } catch {
    return c.json({ error: "Invalid or expired authentication token." }, 401);
  }
  if (typeof payload.sub !== "string" || !payload.sub) return c.json({ error: "Invalid authentication token." }, 401);
  c.set("authUser", {
    id: payload.sub,
    name: typeof payload.name === "string" ? payload.name : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
  });
  await next();
};

router.use("/typing-ranking", requireAuth);
router.use("/game-results", requireAuth);

router.get("/typing-ranking", async (c) => {
  const connectionString = c.env?.HYPERDRIVE?.connectionString
    ?? c.env?.DATABASE_URL
    ?? process.env.DATABASE_URL;
  if (!connectionString) return c.json({ error: "Result storage is not configured." }, 503);

  try {
    const db = c.env?.HYPERDRIVE ? (await getWorkerDatabase(connectionString)).db : getDatabase(connectionString);
    const personalBests = await db.selectDistinctOn([gameResults.userId], {
      userId: gameResults.userId,
      displayName: userProfiles.displayName,
      wpm: gameResults.wpm,
      accuracy: gameResults.accuracy,
      playedAt: gameResults.playedAt,
    }).from(gameResults).innerJoin(userProfiles, eq(gameResults.userId, userProfiles.id))
      .where(eq(gameResults.gameType, "typing"))
      .orderBy(asc(gameResults.userId), desc(gameResults.accuracy), desc(gameResults.wpm), asc(gameResults.playedAt), asc(gameResults.id));

    const ranking = personalBests
      .sort((a, b) => b.accuracy - a.accuracy || (b.wpm ?? 0) - (a.wpm ?? 0) || a.playedAt.getTime() - b.playedAt.getTime() || a.userId.localeCompare(b.userId))
      .slice(0, 10);
    return c.json(ranking);
  } catch (error) {
    console.error("Could not load typing ranking", error);
    return c.json({ error: "Could not load typing ranking." }, 500);
  }
});

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
    const db = c.env?.HYPERDRIVE ? (await getWorkerDatabase(connectionString)).db : getDatabase(connectionString);
    const authUser = c.get("authUser");
    const displayName = authUser.name?.trim().slice(0, 80) || authUser.email?.split("@")[0]?.slice(0, 80) || "利用者";
    await db.insert(userProfiles).values({ id: authUser.id, displayName })
      .onConflictDoUpdate({ target: userProfiles.id, set: { displayName, updatedAt: new Date() } });
    const [current] = await db.insert(gameResults).values({
      userId: authUser.id,
      gameType: input.gameType,
      wpm: input.gameType === "typing" ? input.wpm! : null,
      accuracy: input.accuracy,
      errors: input.gameType === "typing" ? input.errors! : null,
      score: input.score,
      totalQuestions: input.gameType === "typing" ? null : input.totalQuestions!,
      correctAnswers: input.gameType === "typing" ? null : input.correctAnswers!,
    }).returning();
    const history = await db.select().from(gameResults)
      .where(and(eq(gameResults.userId, authUser.id), eq(gameResults.gameType, input.gameType)))
      .orderBy(desc(gameResults.playedAt), desc(gameResults.id));
    const { previous, best } = compareGameResults(history, current);
    return c.json({ current, previous, best });
  } catch (error) {
    console.error("Could not save game result", { databaseErrors: describeDatabaseError(error) });
    return c.json({ error: "Could not save game result." }, 500);
  }
});

export default router;

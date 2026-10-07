export type GameType = "typing" | "sql" | "linux";
export type ResultInput = {
  userId: string;
  gameType: GameType;
  wpm?: number;
  accuracy: number;
  errors?: number;
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
};

const isNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

export function validateResult(value: unknown): value is ResultInput {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  if (typeof body.userId !== "string" || !body.userId.trim()) return false;
  if (!["typing", "sql", "linux"].includes(String(body.gameType))) return false;
  if (!isNumber(body.accuracy) || body.accuracy < 0 || body.accuracy > 100) return false;
  if (!isNumber(body.score) || body.score < 0 || !Number.isInteger(body.score)) return false;
  if (body.gameType === "typing") {
    return isNumber(body.wpm) && body.wpm >= 0 && Number.isInteger(body.wpm)
      && isNumber(body.errors) && body.errors >= 0 && Number.isInteger(body.errors);
  }
  return isNumber(body.totalQuestions) && Number.isInteger(body.totalQuestions)
    && body.totalQuestions > 0 && body.totalQuestions <= 10
    && isNumber(body.correctAnswers) && Number.isInteger(body.correctAnswers)
    && body.correctAnswers >= 0 && body.correctAnswers <= body.totalQuestions
    && body.score === body.correctAnswers
    && body.accuracy === Math.round((body.correctAnswers / body.totalQuestions) * 100);
}

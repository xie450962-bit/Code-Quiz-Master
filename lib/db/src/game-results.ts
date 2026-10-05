import type { GameResultRecord } from "./schema";

export function compareGameResults(
  history: GameResultRecord[],
  current: GameResultRecord,
): { previous: GameResultRecord | null; best: GameResultRecord } {
  const matching = history
    .filter((record) => record.userId === current.userId && record.gameType === current.gameType)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime() || b.id - a.id);
  const previous = matching.find((record) => record.id !== current.id) ?? null;
  const typing = current.gameType === "typing";
  const best = [...matching].sort((a, b) => {
    const scoreDifference = typing
      ? b.score - a.score
      : (b.correctAnswers ?? 0) - (a.correctAnswers ?? 0);
    return scoreDifference || b.playedAt.getTime() - a.playedAt.getTime() || b.id - a.id;
  })[0] ?? current;
  return { previous, best };
}

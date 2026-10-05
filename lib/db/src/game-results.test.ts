import assert from "node:assert/strict";
import test from "node:test";
import { compareGameResults } from "./game-results.ts";
import type { GameResultRecord } from "./schema";

function record(overrides: Partial<GameResultRecord> = {}): GameResultRecord {
  return {
    id: 1,
    userId: "user-a",
    gameType: "typing",
    wpm: 30,
    accuracy: 90,
    errors: 2,
    score: 70,
    totalQuestions: null,
    correctAnswers: null,
    playedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

test("first result is both current and personal best, without a previous result", () => {
  const current = record();
  assert.deepEqual(compareGameResults([current], current), { previous: null, best: current });
});

test("typing personal best uses score, and equal scores prefer the newer result", () => {
  const first = record({ id: 1, score: 80 });
  const previous = record({ id: 2, score: 65, playedAt: new Date("2026-01-02T00:00:00Z") });
  const current = record({ id: 3, score: 80, playedAt: new Date("2026-01-03T00:00:00Z") });
  const result = compareGameResults([current, previous, first], current);
  assert.equal(result.previous?.id, previous.id);
  assert.equal(result.best.id, current.id);
});

test("quiz personal best uses correct answers and does not mix users or games", () => {
  const sqlOld = record({ id: 4, gameType: "sql", score: 8, correctAnswers: 8, totalQuestions: 10 });
  const sqlBest = record({ id: 5, gameType: "sql", score: 9, correctAnswers: 9, totalQuestions: 10, playedAt: new Date("2026-01-02T00:00:00Z") });
  const current = record({ id: 6, gameType: "sql", score: 7, correctAnswers: 7, totalQuestions: 10, playedAt: new Date("2026-01-03T00:00:00Z") });
  const otherUser = record({ id: 7, userId: "user-b", gameType: "sql", correctAnswers: 10, score: 10 });
  const otherGame = record({ id: 8, gameType: "linux", correctAnswers: 10, score: 10 });
  const result = compareGameResults([otherUser, otherGame, current, sqlBest, sqlOld], current);
  assert.equal(result.previous?.id, sqlBest.id);
  assert.equal(result.best.id, sqlBest.id);
});

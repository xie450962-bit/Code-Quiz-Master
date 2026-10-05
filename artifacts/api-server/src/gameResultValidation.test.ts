import assert from "node:assert/strict";
import test from "node:test";
import { validateResult } from "./gameResultValidation.ts";

test("accepts valid typing results at zero and typical values", () => {
  assert.equal(validateResult({ userId: "user-a", gameType: "typing", wpm: 0, accuracy: 0, errors: 0, score: 0 }), true);
  assert.equal(validateResult({ userId: "user-a", gameType: "typing", wpm: 42, accuracy: 97, errors: 3, score: 82 }), true);
});

test("accepts SQL and Linux quiz results at both score boundaries", () => {
  for (const gameType of ["sql", "linux"]) {
    assert.equal(validateResult({ userId: "user-a", gameType, totalQuestions: 10, correctAnswers: 0, accuracy: 0, score: 0 }), true);
    assert.equal(validateResult({ userId: "user-a", gameType, totalQuestions: 10, correctAnswers: 10, accuracy: 100, score: 10 }), true);
  }
});

test("rejects malformed, unknown, out-of-range, and inconsistent results", () => {
  assert.equal(validateResult(null), false);
  assert.equal(validateResult({ userId: " ", gameType: "sql", accuracy: 0, score: 0 }), false);
  assert.equal(validateResult({ userId: "a", gameType: "other", accuracy: 0, score: 0 }), false);
  assert.equal(validateResult({ userId: "a", gameType: "typing", wpm: -1, accuracy: 100, errors: 0, score: 1 }), false);
  assert.equal(validateResult({ userId: "a", gameType: "sql", totalQuestions: 10, correctAnswers: 8, accuracy: 80, score: 9 }), false);
  assert.equal(validateResult({ userId: "a", gameType: "linux", totalQuestions: 9, correctAnswers: 9, accuracy: 100, score: 9 }), false);
});

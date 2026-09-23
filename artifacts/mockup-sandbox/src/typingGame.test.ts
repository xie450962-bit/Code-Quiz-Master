import assert from "node:assert/strict";
import test from "node:test";

import {
  applyTypingInput,
  calculateTypingResult,
  calculateTypingScore,
  formatRemainingTime,
  getRemainingSeconds,
  TYPING_DURATION_SECONDS,
  TYPING_PROMPTS,
} from "./typingGame.ts";

test("sample prompts include several sentences from both genres", () => {
  const genreCounts = TYPING_PROMPTS.reduce<Record<string, number>>((counts, prompt) => {
    counts[prompt.genre] = (counts[prompt.genre] ?? 0) + 1;
    return counts;
  }, {});

  assert.ok(TYPING_PROMPTS.length >= 10);
  assert.ok(genreCounts["IT系"] >= 5);
  assert.ok(genreCounts["一般系"] >= 5);
});

test("incorrect characters count as mistakes without advancing", () => {
  const result = applyTypingInput("今日は良い天気です。", "今日は", "今日は悪");

  assert.equal(result.acceptedText, "今日は");
  assert.equal(result.correctCharacters, 0);
  assert.equal(result.mistakes, 1);
  assert.equal(result.completed, false);
});

test("the next expected character is accepted after a mistake", () => {
  const result = applyTypingInput("今日は良い天気です。", "今日は", "今日は良");

  assert.equal(result.acceptedText, "今日は良");
  assert.equal(result.correctCharacters, 1);
  assert.equal(result.mistakes, 0);
});

test("a wrong character does not stop a later correct character in the same input", () => {
  const result = applyTypingInput("今日は良い天気です。", "今日", "今日は悪");

  assert.equal(result.acceptedText, "今日は");
  assert.equal(result.correctCharacters, 1);
  assert.equal(result.mistakes, 1);
});

test("a completed Japanese phrase is reported", () => {
  const result = applyTypingInput("猫𠮷。", "猫𠮷", "猫𠮷。");

  assert.equal(result.completed, true);
  assert.equal(result.acceptedText, "猫𠮷。");
  assert.equal(result.correctCharacters, 1);
});

test("characters after the end of an answer do not alter its completion", () => {
  const result = applyTypingInput("猫", "", "猫犬");

  assert.equal(result.acceptedText, "猫");
  assert.equal(result.completed, true);
  assert.equal(result.mistakes, 0);
});

test("deleting or replacing already accepted text does not move progress", () => {
  const deleted = applyTypingInput("今日は晴れです。", "今日は", "今日");
  const replaced = applyTypingInput("今日は晴れです。", "今日は", "今日は悪");

  assert.equal(deleted.acceptedText, "今日は");
  assert.equal(deleted.mistakes, 0);
  assert.equal(replaced.acceptedText, "今日は");
  assert.equal(replaced.mistakes, 1);
});

test("remaining time uses the elapsed clock and clamps at zero", () => {
  assert.equal(getRemainingSeconds(1_000, 1_000), TYPING_DURATION_SECONDS);
  assert.equal(getRemainingSeconds(1_000, 2_000), 179);
  assert.equal(getRemainingSeconds(1_000, 180_999), 1);
  assert.equal(getRemainingSeconds(1_000, 181_000), 0);
  assert.equal(getRemainingSeconds(1_000, 200_000), 0);
  assert.equal(getRemainingSeconds(2_000, 1_000), TYPING_DURATION_SECONDS);
});

test("remaining time is formatted as minutes and seconds", () => {
  assert.equal(formatRemainingTime(180), "3:00");
  assert.equal(formatRemainingTime(179), "2:59");
  assert.equal(formatRemainingTime(1), "0:01");
  assert.equal(formatRemainingTime(0), "0:00");
});

test("typing results include WPM, accuracy, errors, and a bounded score", () => {
  const result = calculateTypingResult(100, 10, 60_000);

  assert.deepEqual(result, {
    wpm: 20,
    accuracy: 91,
    mistakes: 10,
    score: 58,
    correctCharacters: 100,
  });
});

test("no input yields zero accuracy, WPM, and score", () => {
  const result = calculateTypingResult(0, 0, 0);

  assert.equal(result.wpm, 0);
  assert.equal(result.accuracy, 0);
  assert.equal(result.score, 0);
});

test("score caps speed, clamps accuracy, and cannot fall below zero", () => {
  assert.equal(calculateTypingScore(120, 100, 0), 100);
  assert.equal(calculateTypingScore(60, 100, 100), 0);
  assert.equal(calculateTypingScore(60, 150, 0), 100);
  assert.equal(calculateTypingScore(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN), 0);
});

test("invalid elapsed time cannot produce a non-finite result", () => {
  const result = calculateTypingResult(0, 0, Number.NaN);

  assert.equal(result.wpm, 0);
  assert.equal(result.accuracy, 0);
  assert.equal(result.score, 0);
});

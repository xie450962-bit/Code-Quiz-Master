import assert from "node:assert/strict";
import test from "node:test";

import { calculateQuizResult, QUIZ_QUESTIONS } from "./quizGame.ts";

test("SQL and Linux quizzes each contain ten fixed questions with four valid choices", () => {
  for (const game of ["sql", "linux"] as const) {
    const questions = QUIZ_QUESTIONS[game];

    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map((question) => question.id)).size, 10);
    for (const question of questions) {
      assert.equal(question.options.length, 4);
      assert.ok(question.correct >= 0 && question.correct < question.options.length);
    }
  }
});

test("SQL question order covers the requested introductory subjects", () => {
  assert.deepEqual(
    QUIZ_QUESTIONS.sql.map((question) => question.id),
    ["sql-select", "sql-where", "sql-order-by", "sql-group-by", "sql-join", "sql-insert", "sql-update", "sql-delete", "sql-null", "sql-aggregate"],
  );
});

test("Linux question order covers basic commands and process inspection", () => {
  assert.deepEqual(
    QUIZ_QUESTIONS.linux.map((question) => question.id),
    ["linux-pwd", "linux-cd", "linux-ls", "linux-mkdir", "linux-rm", "linux-cp-mv", "linux-cat", "linux-grep", "linux-chmod", "linux-process"],
  );
});

test("all correct answers produce ten out of ten and 100 percent accuracy", () => {
  const questions = QUIZ_QUESTIONS.sql;
  const result = calculateQuizResult(questions, questions.map((question) => question.correct));

  assert.deepEqual(result, { correctCount: 10, totalQuestions: 10, accuracy: 100 });
});

test("all incorrect answers produce zero out of ten and zero percent accuracy", () => {
  const questions = QUIZ_QUESTIONS.linux;
  const result = calculateQuizResult(
    questions,
    questions.map((question) => (question.correct + 1) % question.options.length),
  );

  assert.deepEqual(result, { correctCount: 0, totalQuestions: 10, accuracy: 0 });
});

test("mixed answers count only the selected correct options", () => {
  const questions = QUIZ_QUESTIONS.sql;
  const answers = questions.map((question, index) => (
    index % 2 === 0 ? question.correct : (question.correct + 1) % question.options.length
  ));

  assert.deepEqual(calculateQuizResult(questions, answers), {
    correctCount: 5,
    totalQuestions: 10,
    accuracy: 50,
  });
});

test("missing answers are treated as incorrect", () => {
  const result = calculateQuizResult(QUIZ_QUESTIONS.linux, []);

  assert.deepEqual(result, { correctCount: 0, totalQuestions: 10, accuracy: 0 });
});

test("an empty quiz has zero questions and zero accuracy", () => {
  assert.deepEqual(calculateQuizResult([], []), {
    correctCount: 0,
    totalQuestions: 0,
    accuracy: 0,
  });
});

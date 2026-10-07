import { pgTable, serial, text, integer, real, timestamp, index } from "drizzle-orm/pg-core";

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  gameType: text("game_type").notNull(),
  wpm: integer("wpm"),
  accuracy: real("accuracy").notNull(),
  errors: integer("errors"),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("game_results_user_game_played_idx").on(table.userId, table.gameType, table.playedAt)]);

export type GameResultRecord = typeof gameResults.$inferSelect;

export const typingPrompts = pgTable("typing_prompts", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  text: text("text").notNull(),
  active: integer("active").notNull().default(1),
}, (table) => [index("typing_prompts_category_active_idx").on(table.category, table.active)]);

export const quizQuestions = pgTable("quiz_questions", {
  id: text("id").primaryKey(),
  gameType: text("game_type").notNull(),
  difficulty: text("difficulty").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correct: integer("correct").notNull(),
  active: integer("active").notNull().default(1),
}, (table) => [index("quiz_questions_game_difficulty_active_idx").on(table.gameType, table.difficulty, table.active)]);

export type TypingPromptRecord = typeof typingPrompts.$inferSelect;
export type QuizQuestionRecord = typeof quizQuestions.$inferSelect;

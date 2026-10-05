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

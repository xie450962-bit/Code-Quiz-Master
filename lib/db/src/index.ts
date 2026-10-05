import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import type { Pool as PgPool } from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const pools = new Map<string, PgPool>();

export function getDatabase(connectionString: string) {
  let pool = pools.get(connectionString);
  if (!pool) {
    pool = new Pool({ connectionString, max: 5 });
    pools.set(connectionString, pool);
  }
  return drizzle(pool, { schema });
}

export * from "./schema";
export * from "./game-results";

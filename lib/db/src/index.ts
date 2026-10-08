import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import type { Pool as PgPool } from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const pools = new Map<string, PgPool>();

/** Create a request-scoped database client for Cloudflare Workers/Hyperdrive. */
export async function getWorkerDatabase(connectionString: string) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  return { db: drizzle(client, { schema }), client };
}

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

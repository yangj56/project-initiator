import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
  dbPool: Pool | undefined;
};

function createDb() {
  const pool = globalForDb.dbPool ?? new Pool({ connectionString: env.DATABASE_URL });
  if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;
  return drizzle(pool);
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { SCHEMA_STATEMENTS } from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __sqlClient: NeonQueryFunction<false, false> | undefined;
  // eslint-disable-next-line no-var
  var __schemaReady: Promise<void> | undefined;
}

/**
 * Neon's Vercel integration injects DATABASE_URL; POSTGRES_URL is accepted as a
 * fallback so other Postgres providers work without a code change.
 */
function connectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL env var is not set");
  }
  return url;
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!global.__sqlClient) {
    global.__sqlClient = neon(connectionString());
  }
  return global.__sqlClient;
}

export type Row = Record<string, unknown>;

export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  await ensureSchema();
  const rows = await getSql().query(text, params);
  return rows as Row[];
}

/**
 * Cached as a promise, not a boolean, so concurrent requests on a cold start
 * await the same run instead of each firing the DDL.
 */
export function ensureSchema(): Promise<void> {
  if (!global.__schemaReady) {
    global.__schemaReady = (async () => {
      const sql = getSql();
      for (const statement of SCHEMA_STATEMENTS) {
        await sql.query(statement);
      }
    })().catch((err) => {
      global.__schemaReady = undefined;
      throw err;
    });
  }
  return global.__schemaReady;
}

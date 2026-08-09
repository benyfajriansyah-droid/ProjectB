import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
}

function buildClient(): Client {
  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient(authToken ? { url, authToken } : { url });
}

export function getDb(): Client {
  if (!global.__dbClient) {
    global.__dbClient = buildClient();
  }
  return global.__dbClient;
}

export async function ensureSchema(): Promise<void> {
  if (global.__dbInitialized) return;
  const db = getDb();
  const schema = readFileSync(join(process.cwd(), "lib", "schema.sql"), "utf-8");
  await db.executeMultiple(schema);
  global.__dbInitialized = true;
}

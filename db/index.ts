/// <reference types="vite/client" />
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

const MISSING_DB =
  "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database.";

// In production the Sites platform applies `drizzle/**` before the worker runs.
// Local `vinext dev` starts with an empty miniflare D1, so we apply the
// generated migrations once per process. `import.meta.env.DEV` is statically
// `false` in production builds, so this whole block is dropped from the deploy.
const LOCAL_MIGRATIONS = import.meta.env.DEV
  ? (import.meta.glob("../drizzle/*.sql", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>)
  : {};

let localSchemaReady: Promise<void> | null = null;
function ensureLocalSchema(d1: D1Database): Promise<void> {
  return (localSchemaReady ??= (async () => {
    for (const path of Object.keys(LOCAL_MIGRATIONS).sort()) {
      const statements = LOCAL_MIGRATIONS[path]
        .split("--> statement-breakpoint")
        .map((raw) =>
          raw
            .trim()
            .replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ")
            .replace(/^CREATE (UNIQUE )?INDEX /i, "CREATE $1INDEX IF NOT EXISTS ")
        )
        .filter(Boolean);
      for (const statement of statements) {
        try {
          await d1.prepare(statement).run();
        } catch (error) {
          // Legacy local databases predate migration tracking. Only tolerate a
          // previously applied statement; never hide a broken new migration.
          if (!(error instanceof Error) || !/already exists|duplicate column name|UNIQUE constraint failed/i.test(error.message)) throw error;
        }
      }
    }
  })());
}

export async function getDb() {
  const runtimeEnv = env as typeof env & { DB?: D1Database };
  if (!runtimeEnv.DB) throw new Error(MISSING_DB);
  if (import.meta.env.DEV) await ensureLocalSchema(runtimeEnv.DB);
  return drizzle(runtimeEnv.DB, { schema });
}

export async function getStore(): Promise<D1Database> {
  await getDb();
  return (env as typeof env & { DB: D1Database }).DB;
}

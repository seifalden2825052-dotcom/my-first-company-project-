import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function getDatabaseUrl(): URL {
  // Environment-variable UIs occasionally preserve harmless surrounding
  // whitespace or quotes when a connection URL is pasted in.
  const raw = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  try {
    return new URL(raw);
  } catch {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection URL.",
    );
  }
}

const databaseUrl = getDatabaseUrl();

if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
  throw new Error(
    "DATABASE_URL must use the postgres:// or postgresql:// protocol.",
  );
}

// Neon requires TLS when the application is outside its managed network.
// Use the hostname rather than a hosting-specific flag so this remains
// portable to Hostinger and other Node hosts.
const isNeon = databaseUrl.hostname.endsWith(".neon.tech");

export const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";

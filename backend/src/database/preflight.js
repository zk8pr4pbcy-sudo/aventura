import { readdir } from "node:fs/promises";

const migrationsDir = new URL("../../database/migrations/", import.meta.url);

export async function listExpectedMigrations() {
  return (await readdir(migrationsDir))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();
}

export async function verifyProductionDatabase(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  await pool.query("SELECT 1");
  const expected = await listExpectedMigrations();
  const applied = await pool.query(
    "SELECT filename FROM schema_migrations ORDER BY filename"
  );
  const appliedNames = new Set(applied.rows.map((row) => row.filename));
  const missing = expected.filter((filename) => !appliedNames.has(filename));

  if (missing.length > 0) {
    throw new Error(`Database migrations missing: ${missing.join(", ")}`);
  }

  return {
    database: "ok",
    migrations: expected.length
  };
}

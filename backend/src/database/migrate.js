import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createDatabasePool } from "./pool.js";
import { loadConfig } from "../config.js";

const migrationsDir = new URL("../../database/migrations/", import.meta.url);

export async function runMigrations(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();

  for (const filename of files) {
    const exists = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [filename]
    );
    if (exists.rowCount) continue;

    const sql = await readFile(new URL(filename, migrationsDir), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations(filename) VALUES ($1)",
        [filename]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = loadConfig();
  const pool = createDatabasePool(config.databaseUrl);
  try {
    await runMigrations(pool);
    console.log("Database migrations completed.");
  } finally {
    await pool.end();
  }
}

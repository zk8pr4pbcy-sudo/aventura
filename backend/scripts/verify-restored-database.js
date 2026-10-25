import pg from "pg";

const { Pool } = pg;
const databaseUrl = process.env.RESTORE_DATABASE_URL;
if (!databaseUrl) throw new Error("RESTORE_DATABASE_URL is required");

const requiredTables = [
  "schema_migrations",
  "users",
  "customers",
  "experience_requests",
  "collaboration_requests",
  "request_status_history",
  "internal_notes",
  "website_content",
  "audit_log",
  "admin_sessions",
  "notification_outbox"
];

const pool = new Pool({ connectionString: databaseUrl });
try {
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  const names = new Set(tables.rows.map((row) => row.tablename));
  for (const table of requiredTables) {
    if (!names.has(table)) throw new Error(`Restored database is missing table: ${table}`);
  }

  const migrations = await pool.query("SELECT count(*)::int AS count FROM schema_migrations");
  if (migrations.rows[0].count < 6) {
    throw new Error(`Restored database has too few migrations: ${migrations.rows[0].count}`);
  }

  const experience = await pool.query("SELECT count(*)::int AS count FROM experience_requests");
  const collaboration = await pool.query("SELECT count(*)::int AS count FROM collaboration_requests");
  if (experience.rows[0].count < 1 || collaboration.rows[0].count < 1) {
    throw new Error("Restored database did not preserve request data");
  }

  const references = await pool.query(
    `SELECT reference_number FROM experience_requests
     UNION ALL
     SELECT reference_number FROM collaboration_requests`
  );
  if (!references.rows.every((row) => /^AV-(EXP|COL)-\d{4}-\d{6}$/.test(row.reference_number))) {
    throw new Error("Restored request references failed integrity verification");
  }

  console.log("Restored PostgreSQL backup passed schema and request integrity checks.");
} finally {
  await pool.end();
}

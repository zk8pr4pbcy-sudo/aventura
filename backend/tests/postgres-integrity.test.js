import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";

const databaseUrl = process.env.DATABASE_URL;

test("PostgreSQL rejects status history for a nonexistent request", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  try {
    const missingId = "00000000-0000-4000-8000-000000000001";
    await assert.rejects(
      pool.query(
        `INSERT INTO request_status_history (request_kind, request_id, to_status)
         VALUES ('experience', $1, 'new')`,
        [missingId]
      ),
      (error) => error?.code === "23503"
    );
  } finally {
    await pool.end();
  }
});

test("PostgreSQL rejects internal notes for a nonexistent request", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  try {
    const missingId = "00000000-0000-4000-8000-000000000002";
    const user = await pool.query(
      `INSERT INTO users (email, display_name, role)
       VALUES ($1, $2, 'admin')
       RETURNING id`,
      [`integrity-${Date.now()}@example.test`, "Integrity Test Admin"]
    );

    await assert.rejects(
      pool.query(
        `INSERT INTO internal_notes (request_kind, request_id, author_id, body)
         VALUES ('collaboration', $1, $2, $3)`,
        [missingId, user.rows[0].id, "This note must not be accepted."]
      ),
      (error) => error?.code === "23503"
    );
  } finally {
    await pool.end();
  }
});

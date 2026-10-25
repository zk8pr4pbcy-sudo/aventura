import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresAdminDashboardRepository } from "../src/admin/postgres-dashboard-repository.js";

const databaseUrl = process.env.DATABASE_URL;

test("dashboard repository counts persisted requests", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  let requestId;
  let customerId;

  try {
    const customer = await pool.query(
      `INSERT INTO customers (full_name, phone, preferred_language)
       VALUES ('Dashboard CI Guest', '+966522222222', 'ar')
       RETURNING id`
    );
    customerId = customer.rows[0].id;
    const request = await pool.query(
      `INSERT INTO experience_requests (customer_id, experience_key)
       VALUES ($1, 'historic-jeddah')
       RETURNING id`,
      [customerId]
    );
    requestId = request.rows[0].id;

    const rows = await createPostgresAdminDashboardRepository(pool).getCounts();
    const newExperience = rows.find((row) => row.kind === 'experience' && row.status === 'new');
    assert.ok(newExperience);
    assert.ok(Number(newExperience.count) >= 1);
  } finally {
    if (requestId) await pool.query('DELETE FROM experience_requests WHERE id = $1', [requestId]);
    if (customerId) await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    await pool.end();
  }
});

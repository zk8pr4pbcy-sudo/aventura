import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresAdminRequestsRepository } from "../src/admin/postgres-requests-repository.js";

const databaseUrl = process.env.DATABASE_URL;

test("admin request repository lists and reads persisted requests", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  let experienceId;
  let collaborationId;
  let customerId;

  try {
    const customer = await pool.query(
      `INSERT INTO customers (full_name, email, preferred_language)
       VALUES ('Admin Query CI Guest', 'admin-query-ci@aventura.test', 'en')
       RETURNING id`
    );
    customerId = customer.rows[0].id;

    const experience = await pool.query(
      `INSERT INTO experience_requests (customer_id, experience_key, party_size)
       VALUES ($1, 'historic-jeddah', 4)
       RETURNING id`,
      [customerId]
    );
    experienceId = experience.rows[0].id;

    const collaboration = await pool.query(
      `INSERT INTO collaboration_requests
         (customer_id, organization_name, collaboration_type, proposal)
       VALUES ($1, 'CI Partner', 'corporate-partnership', 'Repository integration test')
       RETURNING id`,
      [customerId]
    );
    collaborationId = collaboration.rows[0].id;

    const repository = createPostgresAdminRequestsRepository(pool);
    const all = await repository.list({ kind: null, status: 'new', limit: 100, before: null });
    assert.equal(all.some((item) => item.id === experienceId && item.kind === 'experience'), true);
    assert.equal(all.some((item) => item.id === collaborationId && item.kind === 'collaboration'), true);

    const detail = await repository.getById({ kind: 'experience', requestId: experienceId });
    assert.equal(detail.customer.fullName, 'Admin Query CI Guest');
    assert.equal(detail.details.experienceKey, 'historic-jeddah');
    assert.equal(detail.details.partySize, 4);
    assert.deepEqual(detail.statusHistory, []);
    assert.deepEqual(detail.internalNotes, []);
  } finally {
    if (experienceId) await pool.query('DELETE FROM experience_requests WHERE id = $1', [experienceId]);
    if (collaborationId) await pool.query('DELETE FROM collaboration_requests WHERE id = $1', [collaborationId]);
    if (customerId) await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    await pool.end();
  }
});

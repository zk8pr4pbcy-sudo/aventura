import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createIdempotencyMetadata } from "../src/security/idempotency.js";
import { createPostgresExperienceRequestRepository } from "../src/experience-requests/postgres-repository.js";
import { createPostgresCollaborationRequestRepository } from "../src/collaboration-requests/postgres-repository.js";

const databaseUrl = process.env.DATABASE_URL;

async function cleanupRequest(pool, table, idempotencyKeyHash) {
  const request = await pool.query(
    `SELECT id, customer_id FROM ${table} WHERE idempotency_key_hash = $1`,
    [idempotencyKeyHash]
  );
  if (!request.rowCount) return;
  const { id, customer_id: customerId } = request.rows[0];
  await pool.query("DELETE FROM notification_outbox WHERE request_id = $1", [id]);
  await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  await pool.query("DELETE FROM customers WHERE id = $1", [customerId]);
}

test("concurrent experience retries create exactly one customer, request and outbox event", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  const repo = createPostgresExperienceRequestRepository(pool);
  const key = randomUUID();
  const base = {
    fullName: "Idempotency Race Guest",
    email: null,
    phone: "+966533333333",
    language: "ar",
    experienceKey: "historic-jeddah",
    requestedDate: null,
    partySize: 2
  };
  const metadata = createIdempotencyMetadata("experience", base, key);
  const input = { ...base, ...metadata };

  try {
    const [first, second] = await Promise.all([repo.create(input), repo.create(input)]);
    assert.equal(first.referenceNumber, second.referenceNumber);
    assert.deepEqual(new Set([first.replayed, second.replayed]), new Set([false, true]));

    const rows = await pool.query(
      `SELECT id, customer_id FROM experience_requests WHERE idempotency_key_hash = $1`,
      [metadata.idempotencyKeyHash]
    );
    assert.equal(rows.rowCount, 1);

    const customer = await pool.query(
      "SELECT count(*)::int AS count FROM customers WHERE id = $1",
      [rows.rows[0].customer_id]
    );
    const outbox = await pool.query(
      `SELECT count(*)::int AS count FROM notification_outbox
       WHERE event_type = 'experience_request.created' AND request_id = $1`,
      [rows.rows[0].id]
    );
    assert.equal(customer.rows[0].count, 1);
    assert.equal(outbox.rows[0].count, 1);
  } finally {
    await cleanupRequest(pool, "experience_requests", metadata.idempotencyKeyHash);
    await pool.end();
  }
});

test("reusing an experience idempotency key with different validated data is rejected", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  const repo = createPostgresExperienceRequestRepository(pool);
  const key = randomUUID();
  const firstBase = {
    fullName: "Idempotency Conflict Guest",
    email: null,
    phone: "+966544444444",
    language: "ar",
    experienceKey: "historic-jeddah",
    requestedDate: null,
    partySize: 2
  };
  const first = { ...firstBase, ...createIdempotencyMetadata("experience", firstBase, key) };
  const changedBase = { ...firstBase, partySize: 3 };
  const changed = { ...changedBase, ...createIdempotencyMetadata("experience", changedBase, key) };

  try {
    await repo.create(first);
    await assert.rejects(
      repo.create(changed),
      (error) => error.statusCode === 409 && error.message === "idempotency_key_reused"
    );

    const count = await pool.query(
      "SELECT count(*)::int AS count FROM experience_requests WHERE idempotency_key_hash = $1",
      [first.idempotencyKeyHash]
    );
    assert.equal(count.rows[0].count, 1);
  } finally {
    await cleanupRequest(pool, "experience_requests", first.idempotencyKeyHash);
    await pool.end();
  }
});

test("collaboration retries return the original collaboration reference", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  const repo = createPostgresCollaborationRequestRepository(pool);
  const key = randomUUID();
  const base = {
    fullName: "Idempotency Partner",
    email: "partner-idempotency@example.com",
    phone: null,
    language: "ar",
    organizationName: "Aventura Test Partner",
    collaborationType: "corporate-partnership",
    proposal: "A durable collaboration idempotency test proposal."
  };
  const metadata = createIdempotencyMetadata("collaboration", base, key);
  const input = { ...base, ...metadata };

  try {
    const first = await repo.create(input);
    const replay = await repo.create(input);
    assert.equal(replay.referenceNumber, first.referenceNumber);
    assert.equal(first.replayed, false);
    assert.equal(replay.replayed, true);

    const count = await pool.query(
      "SELECT count(*)::int AS count FROM collaboration_requests WHERE idempotency_key_hash = $1",
      [metadata.idempotencyKeyHash]
    );
    assert.equal(count.rows[0].count, 1);
  } finally {
    await cleanupRequest(pool, "collaboration_requests", metadata.idempotencyKeyHash);
    await pool.end();
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresNotificationOutboxRepository } from "../src/notifications/postgres-outbox-repository.js";

const databaseUrl = process.env.DATABASE_URL;

test("notification outbox claims, retries and completes durable events", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  let customerId;
  let requestId;
  let eventId;

  try {
    const customer = await pool.query(
      `INSERT INTO customers (full_name, phone, preferred_language)
       VALUES ('Notification CI Guest', '+966533333333', 'ar')
       RETURNING id`
    );
    customerId = customer.rows[0].id;

    const request = await pool.query(
      `INSERT INTO experience_requests (customer_id, experience_key)
       VALUES ($1, 'historic-jeddah')
       RETURNING id, reference_number`,
      [customerId]
    );
    requestId = request.rows[0].id;

    const event = await pool.query(
      `INSERT INTO notification_outbox
         (event_type, request_kind, request_id, payload, available_at)
       VALUES ('ci.notification.test', 'experience', $1, $2::jsonb, now() - interval '1 hour')
       RETURNING id`,
      [requestId, JSON.stringify({ referenceNumber: request.rows[0].reference_number })]
    );
    eventId = event.rows[0].id;

    const repository = createPostgresNotificationOutboxRepository(pool);
    const claimed = await repository.claimNext();
    assert.equal(claimed.id, eventId);
    assert.equal(claimed.status, 'processing');
    assert.equal(claimed.attempts, 1);

    const retryAt = new Date(Date.now() - 1000);
    assert.equal(await repository.markFailed(eventId, 'temporary_failure', retryAt), true);

    const retried = await repository.claimNext();
    assert.equal(retried.id, eventId);
    assert.equal(retried.attempts, 2);
    assert.equal(await repository.markSent(eventId), true);

    const final = await pool.query(
      `SELECT status, attempts, sent_at, last_error
       FROM notification_outbox WHERE id = $1`,
      [eventId]
    );
    assert.equal(final.rows[0].status, 'sent');
    assert.equal(final.rows[0].attempts, 2);
    assert.ok(final.rows[0].sent_at);
    assert.equal(final.rows[0].last_error, null);
  } finally {
    if (eventId) await pool.query('DELETE FROM notification_outbox WHERE id = $1', [eventId]);
    if (requestId) await pool.query('DELETE FROM experience_requests WHERE id = $1', [requestId]);
    if (customerId) await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    await pool.end();
  }
});

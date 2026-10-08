import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { dispatchPendingNotifications } from "../src/notifications/dispatch.js";

const databaseUrl = process.env.DATABASE_URL;

test("notification pipeline turns a durable request event into an operations email", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  let customerId;
  let requestId;
  let eventId;
  const messages = [];

  try {
    const customer = await pool.query(
      `INSERT INTO customers (full_name, email, phone, preferred_language)
       VALUES ('Dispatch CI Guest', 'dispatch-guest@aventura.test', '+966544444444', 'ar')
       RETURNING id`
    );
    customerId = customer.rows[0].id;

    const request = await pool.query(
      `INSERT INTO experience_requests (customer_id, experience_key, party_size)
       VALUES ($1, 'historic-jeddah', 2)
       RETURNING id, reference_number`,
      [customerId]
    );
    requestId = request.rows[0].id;

    const event = await pool.query(
      `INSERT INTO notification_outbox
         (event_type, request_kind, request_id, payload, available_at)
       VALUES ('experience_request.created', 'experience', $1, $2::jsonb, '2000-01-01T00:00:00Z')
       RETURNING id`,
      [requestId, JSON.stringify({ referenceNumber: request.rows[0].reference_number })]
    );
    eventId = event.rows[0].id;

    const result = await dispatchPendingNotifications({
      pool,
      mailer: {
        async sendMail(message) { messages.push(message); }
      },
      emailConfig: { operationsEmail: 'operations@aventura.test' },
      batchSize: 1
    });

    assert.deepEqual(result, { processed: 1, sent: 1, failed: 0 });
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, 'operations@aventura.test');
    assert.match(messages[0].subject, new RegExp(request.rows[0].reference_number));
    assert.match(messages[0].text, /Dispatch CI Guest/);

    const stored = await pool.query(
      `SELECT status, sent_at FROM notification_outbox WHERE id = $1`,
      [eventId]
    );
    assert.equal(stored.rows[0].status, 'sent');
    assert.ok(stored.rows[0].sent_at);
  } finally {
    if (eventId) await pool.query('DELETE FROM notification_outbox WHERE id = $1', [eventId]);
    if (requestId) await pool.query('DELETE FROM experience_requests WHERE id = $1', [requestId]);
    if (customerId) await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    await pool.end();
  }
});

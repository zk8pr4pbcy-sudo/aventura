import assert from "node:assert/strict";
import test from "node:test";
import { createNotificationDispatcher } from "../src/notifications/dispatcher.js";

const EVENT = {
  id: "11111111-1111-4111-8111-111111111111",
  eventType: "experience_request.created",
  requestKind: "experience",
  requestId: "22222222-2222-4222-8222-222222222222",
  payload: { referenceNumber: "AV-EXP-2026-000001" },
  attempts: 1
};

test("dispatcher marks a delivered notification as sent", async () => {
  const calls = [];
  const dispatcher = createNotificationDispatcher(
    {
      async claimNext() { return EVENT; },
      async markSent(id) { calls.push(["sent", id]); },
      async markFailed() { throw new Error("must_not_fail"); }
    },
    {
      async send(event) { calls.push(["send", event.id]); }
    }
  );

  const result = await dispatcher.dispatchOne();
  assert.deepEqual(result, { processed: true, sent: true, eventId: EVENT.id });
  assert.deepEqual(calls, [["send", EVENT.id], ["sent", EVENT.id]]);
});

test("dispatcher schedules retry using a non-sensitive failure code", async () => {
  const failures = [];
  const now = new Date("2026-09-19T01:00:00Z");
  const dispatcher = createNotificationDispatcher(
    {
      async claimNext() { return EVENT; },
      async markSent() { throw new Error("must_not_send"); },
      async markFailed(id, message, retryAt) { failures.push({ id, message, retryAt }); }
    },
    {
      async send() {
        const error = new Error("SMTP failure for private-recipient@example.test");
        error.code = "SMTP_TEMPORARY";
        throw error;
      }
    },
    { now: () => now }
  );

  const result = await dispatcher.dispatchOne();
  assert.equal(result.processed, true);
  assert.equal(result.sent, false);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].id, EVENT.id);
  assert.equal(failures[0].message, "SMTP_TEMPORARY");
  assert.doesNotMatch(failures[0].message, /private-recipient/);
  assert.equal(failures[0].retryAt.toISOString(), "2026-09-19T01:01:00.000Z");
});

test("dispatcher is idle when no notification is available", async () => {
  const dispatcher = createNotificationDispatcher(
    {
      async claimNext() { return null; },
      async markSent() {},
      async markFailed() {}
    },
    { async send() { throw new Error("must_not_send"); } }
  );
  assert.deepEqual(await dispatcher.dispatchOne(), { processed: false });
});

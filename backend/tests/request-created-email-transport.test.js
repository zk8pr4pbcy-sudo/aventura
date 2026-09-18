import assert from "node:assert/strict";
import test from "node:test";
import { createRequestCreatedEmailTransport } from "../src/notifications/request-created-email-transport.js";

const EVENT = {
  id: "11111111-1111-4111-8111-111111111111",
  eventType: "experience_request.created",
  requestKind: "experience",
  requestId: "22222222-2222-4222-8222-222222222222",
  payload: { referenceNumber: "AV-EXP-2026-000001" }
};

test("request-created email loads current database context and sends one operations message", async () => {
  const messages = [];
  const transport = createRequestCreatedEmailTransport({
    contextRepository: {
      async getRequest(input) {
        assert.deepEqual(input, {
          requestKind: "experience",
          requestId: EVENT.requestId
        });
        return {
          kind: "experience",
          referenceNumber: "AV-EXP-2026-000001",
          status: "new",
          customer: {
            fullName: "Test Guest",
            email: "guest@example.test",
            phone: "+966500000000",
            preferredLanguage: "ar"
          },
          details: {
            experienceKey: "historic-jeddah",
            requestedDate: null,
            partySize: 2
          }
        };
      }
    },
    mailer: {
      async sendMail(message) { messages.push(message); }
    },
    operationsEmail: "operations@example.test"
  });

  await transport.send(EVENT);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, "operations@example.test");
  assert.match(messages[0].subject, /AV-EXP-2026-000001/);
  assert.match(messages[0].text, /Test Guest/);
  assert.match(messages[0].text, /historic-jeddah/);
  assert.equal(messages[0].messageId, `<${EVENT.id}@notifications.aventuraksa.com>`);
  assert.equal(messages[0].headers["X-Aventura-Event-ID"], EVENT.id);
});

test("notification email rejects unsupported outbox event types", async () => {
  const transport = createRequestCreatedEmailTransport({
    contextRepository: { async getRequest() { throw new Error("must_not_load"); } },
    mailer: { async sendMail() { throw new Error("must_not_send"); } },
    operationsEmail: "operations@example.test"
  });

  await assert.rejects(
    transport.send({ ...EVENT, eventType: "unknown.event" }),
    /unsupported_notification_event/
  );
});

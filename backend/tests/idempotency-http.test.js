import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

const key = "123e4567-e89b-42d3-a456-426614174000";
const body = {
  fullName: "HTTP Idempotency Guest",
  phone: "+966500000000",
  experienceKey: "historic-jeddah",
  language: "ar",
  partySize: 2
};

async function withServer(service, fn) {
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend",
    publicRequestsEnabled: true,
    publicApiOrigins: [],
    idempotencyRequired: true,
    turnstile: { required: false, secretKey: null, hostnames: [] }
  }, {
    experienceRequests: service
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("missing production-style idempotency key is rejected before persistence", async () => {
  let calls = 0;
  await withServer({ create: async () => { calls += 1; } }, async (base) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "idempotency_key_required" });
    assert.equal(calls, 0);
  });
});

test("valid idempotency key is converted to internal hashes before persistence", async () => {
  await withServer({
    create: async (input) => {
      assert.match(input.idempotencyKeyHash, /^[0-9a-f]{64}$/);
      assert.match(input.idempotencyFingerprint, /^[0-9a-f]{64}$/);
      return { referenceNumber: "AV-EXP-2026-000001", status: "new", replayed: false };
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": key
      },
      body: JSON.stringify(body)
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("idempotency-replayed"), null);
    assert.deepEqual(await response.json(), {
      referenceNumber: "AV-EXP-2026-000001",
      status: "new"
    });
  });
});

test("idempotent replay preserves public response and marks response header", async () => {
  await withServer({
    create: async () => ({
      referenceNumber: "AV-EXP-2026-000001",
      status: "new",
      replayed: true
    })
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": key
      },
      body: JSON.stringify(body)
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("idempotency-replayed"), "true");
    assert.deepEqual(await response.json(), {
      referenceNumber: "AV-EXP-2026-000001",
      status: "new"
    });
  });
});

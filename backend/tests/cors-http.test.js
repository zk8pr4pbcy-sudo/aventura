import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(fn) {
  let persisted = 0;
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend",
    publicRequestsEnabled: true,
    publicApiOrigins: ["https://aventuraksa.com"],
    trustedClientIpHeader: "remote-address",
    turnstile: { required: false, secretKey: null, hostnames: [] }
  }, {
    experienceRequests: {
      async create() {
        persisted += 1;
        return { referenceNumber: `AV-EXP-2026-${String(persisted).padStart(6, "0")}`, status: "new" };
      }
    }
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`, () => persisted);
  } finally {
    server.close();
  }
}

const validBody = {
  fullName: "CORS Test Guest",
  phone: "+966500000000",
  experienceKey: "historic-jeddah",
  language: "ar",
  partySize: 2
};

test("approved browser origin receives CORS preflight and can submit", async () => {
  await withServer(async (base, persisted) => {
    const preflight = await fetch(`${base}/api/v1/experience-requests`, {
      method: "OPTIONS",
      headers: { origin: "https://aventuraksa.com" }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "https://aventuraksa.com");

    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: {
        origin: "https://aventuraksa.com",
        "content-type": "application/json"
      },
      body: JSON.stringify(validBody)
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://aventuraksa.com");
    assert.equal(persisted(), 1);
  });
});

test("unapproved browser origin is rejected before persistence", async () => {
  await withServer(async (base, persisted) => {
    const denied = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/json"
      },
      body: JSON.stringify(validBody)
    });
    assert.equal(denied.status, 403);
    assert.equal(persisted(), 0);
  });
});

test("requests without Origin remain server-to-server compatible", async () => {
  await withServer(async (base, persisted) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody)
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.equal(persisted(), 1);
  });
});

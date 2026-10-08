import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(service, fn) {
  const server = createServer(
    { env: "test", port: 0, serviceName: "aventura-backend" },
    { experienceRequests: service }
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("POST experience request validates before persistence", async () => {
  let called = false;
  await withServer({ create: async () => { called = true; } }, async (base) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: "A" })
    });
    assert.equal(response.status, 422);
    assert.equal(called, false);
  });
});

test("POST experience request returns only public reference and status", async () => {
  await withServer({
    create: async (input) => {
      assert.equal(input.language, "ar");
      return { id: "internal-id-must-not-leak", referenceNumber: "AV-EXP-2026-000001", status: "new" };
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/experience-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Guest",
        phone: "+966500000000",
        experienceKey: "historic-jeddah",
        partySize: 2
      })
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.deepEqual(body, { referenceNumber: "AV-EXP-2026-000001", status: "new" });
  });
});

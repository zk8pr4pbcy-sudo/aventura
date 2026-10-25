import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(service, fn) {
  const server = createServer(
    { env: "test", port: 0, serviceName: "aventura-backend" },
    { collaborationRequests: service }
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("POST collaboration request validates before persistence", async () => {
  let called = false;
  await withServer({ create: async () => { called = true; } }, async (base) => {
    const response = await fetch(`${base}/api/v1/collaboration-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: "A", proposal: "short" })
    });
    assert.equal(response.status, 422);
    assert.equal(called, false);
  });
});

test("POST collaboration request returns only public reference and status", async () => {
  await withServer({
    create: async (input) => {
      assert.equal(input.language, "ar");
      assert.equal(input.collaborationType, "corporate-partnership");
      return { id: "internal-id-must-not-leak", referenceNumber: "AV-COL-2026-000002", status: "new" };
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/collaboration-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Aventura Partner",
        email: "partner@example.com",
        organizationName: "Example Company",
        collaborationType: "corporate-partnership",
        proposal: "We would like to discuss a collaboration with Aventura."
      })
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.deepEqual(body, { referenceNumber: "AV-COL-2026-000002", status: "new" });
  });
});

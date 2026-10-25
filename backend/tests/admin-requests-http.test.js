import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const COOKIE = "aventura_admin_session=test-session-token-that-is-long-enough";

async function withServer(dependencies, fn) {
  const server = createServer(
    { env: "test", port: 0, serviceName: "aventura-backend", databaseUrl: null },
    dependencies
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

function authFor(role) {
  return {
    async authenticate() {
      return { id: USER_ID, email: `${role}@aventura.test`, displayName: role, role, isActive: true };
    },
    async login() { throw new Error("not_used"); },
    async logout() {}
  };
}

test("viewer can read request queue but cannot change request status", async () => {
  let workflowCalled = false;
  await withServer({
    auth: authFor("viewer"),
    adminRequests: {
      async list() { return [{ id: REQUEST_ID, kind: "experience", status: "new" }]; },
      async get() { return { id: REQUEST_ID, kind: "experience", status: "new" }; }
    },
    requestWorkflow: {
      async changeStatus() { workflowCalled = true; },
      async addNote() { workflowCalled = true; }
    }
  }, async (base) => {
    const list = await fetch(`${base}/api/v1/admin/requests`, { headers: { cookie: COOKIE } });
    assert.equal(list.status, 200);
    assert.equal((await list.json()).requests.length, 1);

    const update = await fetch(`${base}/api/v1/admin/requests/experience/${REQUEST_ID}/status`, {
      method: "PATCH",
      headers: { cookie: COOKIE, "content-type": "application/json" },
      body: JSON.stringify({ status: "under_review" })
    });
    assert.equal(update.status, 403);
    assert.equal(workflowCalled, false);
  });
});

test("operations role can update status and add internal notes", async () => {
  const calls = [];
  await withServer({
    auth: authFor("operations"),
    adminRequests: {
      async list() { return []; },
      async get() { return null; }
    },
    requestWorkflow: {
      async changeStatus(input) {
        calls.push(["status", input]);
        return { requestId: input.requestId, kind: input.kind, previousStatus: "new", status: input.toStatus };
      },
      async addNote(input) {
        calls.push(["note", input]);
        return { id: "33333333-3333-4333-8333-333333333333", createdAt: new Date("2026-09-19T00:00:00Z") };
      }
    }
  }, async (base) => {
    const update = await fetch(`${base}/api/v1/admin/requests/experience/${REQUEST_ID}/status`, {
      method: "PATCH",
      headers: { cookie: COOKIE, "content-type": "application/json" },
      body: JSON.stringify({ status: "under_review", note: "Started review" })
    });
    assert.equal(update.status, 200);

    const note = await fetch(`${base}/api/v1/admin/requests/experience/${REQUEST_ID}/notes`, {
      method: "POST",
      headers: { cookie: COOKIE, "content-type": "application/json" },
      body: JSON.stringify({ body: "Private operations note" })
    });
    assert.equal(note.status, 201);
    assert.equal(calls.length, 2);
    assert.equal(calls[0][1].actorUserId, USER_ID);
    assert.equal(calls[1][1].authorUserId, USER_ID);
  });
});

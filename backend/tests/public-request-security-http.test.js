import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(config, dependencies, fn) {
  const server = createServer(config, dependencies);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

function config(overrides = {}) {
  return {
    env: "test",
    port: 0,
    serviceName: "aventura-backend",
    databaseUrl: null,
    publicRequestsEnabled: true,
    turnstile: { required: false, secretKey: null, hostnames: [] },
    ...overrides
  };
}

test("disabled public request ingestion returns 404 without persistence", async () => {
  let called = false;
  await withServer(
    config({ publicRequestsEnabled: false }),
    {
      experienceRequests: {
        async create() { called = true; }
      }
    },
    async (base) => {
      const response = await fetch(`${base}/api/v1/experience-requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: "Test Guest",
          phone: "+966500000000",
          experienceKey: "historic-jeddah"
        })
      });
      assert.equal(response.status, 404);
      assert.equal(called, false);
    }
  );
});

test("required Turnstile verification runs before experience persistence", async () => {
  let verifierInput;
  let persisted = false;
  await withServer(
    config({
      turnstile: {
        required: true,
        secretKey: "secret",
        hostnames: ["aventuraksa.com"]
      }
    }),
    {
      turnstileVerifier: async (input) => {
        verifierInput = input;
        return { success: true, action: input.expectedAction, hostname: "aventuraksa.com" };
      },
      experienceRequests: {
        async create() {
          persisted = true;
          return { referenceNumber: "AV-EXP-2026-000001", status: "new" };
        }
      }
    },
    async (base) => {
      const response = await fetch(`${base}/api/v1/experience-requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: "Test Guest",
          phone: "+966500000000",
          experienceKey: "historic-jeddah",
          turnstileToken: "token-123"
        })
      });
      assert.equal(response.status, 201);
      assert.equal(persisted, true);
      assert.equal(verifierInput.token, "token-123");
      assert.equal(verifierInput.expectedAction, "experience_request");
      assert.deepEqual(verifierInput.expectedHostnames, ["aventuraksa.com"]);
    }
  );
});

test("failed Turnstile verification blocks collaboration persistence", async () => {
  let persisted = false;
  await withServer(
    config({
      turnstile: {
        required: true,
        secretKey: "secret",
        hostnames: ["aventuraksa.com"]
      }
    }),
    {
      turnstileVerifier: async ({ expectedAction }) => {
        assert.equal(expectedAction, "collaboration_request");
        const error = new Error("turnstile_failed");
        error.statusCode = 403;
        throw error;
      },
      collaborationRequests: {
        async create() {
          persisted = true;
          return { referenceNumber: "AV-COL-2026-000001", status: "new" };
        }
      }
    },
    async (base) => {
      const response = await fetch(`${base}/api/v1/collaboration-requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: "Test Partner",
          email: "partner@example.com",
          collaborationType: "corporate-partnership",
          proposal: "Test proposal for CI validation.",
          turnstileToken: "bad-token"
        })
      });
      const body = await response.json();
      assert.equal(response.status, 403);
      assert.equal(body.error, "turnstile_failed");
      assert.equal(persisted, false);
    }
  );
});

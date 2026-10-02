import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

test("admin login rate limit returns 429 with Retry-After before authentication", async () => {
  let loginCalled = false;
  const server = createServer(
    {
      env: "test",
      port: 0,
      serviceName: "aventura-backend",
      databaseUrl: null,
      publicRequestsEnabled: true,
      turnstile: { required: false, secretKey: null, hostnames: [] }
    },
    {
      auth: {
        async login() {
          loginCalled = true;
          throw new Error("must_not_run");
        }
      },
      loginLimiter: {
        assertAllowed() {
          const error = new Error("too_many_login_attempts");
          error.statusCode = 429;
          error.retryAfterSeconds = 42;
          throw error;
        },
        recordFailure() {},
        recordSuccess() {}
      }
    }
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/admin/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "owner@example.com", password: "wrong-password" })
    });
    const body = await response.json();
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "42");
    assert.equal(body.error, "too_many_login_attempts");
    assert.equal(loginCalled, false);
  } finally {
    server.close();
  }
});

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(auth, fn) {
  const server = createServer(
    { env: "test", port: 0, serviceName: "aventura-backend", databaseUrl: null },
    { auth }
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("admin login uses HttpOnly cookie and does not expose token in JSON", async () => {
  const token = "test-session-token-that-is-long-enough";
  const auth = {
    async login({ email, password }) {
      assert.equal(email, "admin@aventura.test");
      assert.equal(password, "test-password");
      return {
        token,
        expiresAt: new Date("2026-09-20T00:00:00Z"),
        user: { id: "u1", email, displayName: "Admin", role: "admin", isActive: true }
      };
    },
    async authenticate(value) {
      assert.equal(value, token);
      return { id: "u1", email: "admin@aventura.test", displayName: "Admin", role: "admin", isActive: true };
    },
    async logout(value) { assert.equal(value, token); }
  };

  await withServer(auth, async (base) => {
    const login = await fetch(`${base}/api/v1/admin/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@aventura.test", password: "test-password" })
    });
    const body = await login.json();
    const setCookie = login.headers.get("set-cookie");
    assert.equal(login.status, 200);
    assert.equal(body.token, undefined);
    assert.equal(body.user.role, "admin");
    assert.match(setCookie, /aventura_admin_session=/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(setCookie, /Path=\/api\/v1\/admin/);

    const cookie = setCookie.split(";")[0];
    const session = await fetch(`${base}/api/v1/admin/auth/session`, {
      headers: { cookie }
    });
    assert.equal(session.status, 200);
    assert.equal((await session.json()).user.role, "admin");

    const logout = await fetch(`${base}/api/v1/admin/auth/logout`, {
      method: "POST",
      headers: { cookie }
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  });
});

test("admin auth endpoints stay unavailable without configured auth", async () => {
  await withServer(null, async (base) => {
    const response = await fetch(`${base}/api/v1/admin/auth/session`);
    assert.equal(response.status, 503);
  });
});

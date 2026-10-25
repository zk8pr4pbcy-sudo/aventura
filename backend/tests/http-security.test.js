import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

test("JSON endpoints include restrictive security headers", async () => {
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend",
    databaseUrl: null,
    publicRequestsEnabled: true,
    turnstile: { required: false, secretKey: null, hostnames: [] }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.match(response.headers.get("content-security-policy") || "", /default-src 'none'/);
    assert.match(response.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);
  } finally {
    server.close();
  }
});

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

test("HTTP access log emits request id and excludes query-string data", async () => {
  const logs = [];
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend"
  }, {
    accessLogWrite: (line) => logs.push(line)
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/health?email=secret@example.com`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("x-request-id"), /^[0-9a-f-]{36}$/i);

    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(logs.length, 1);
    const entry = JSON.parse(logs[0]);
    assert.equal(entry.event, "http_request");
    assert.equal(entry.method, "GET");
    assert.equal(entry.path, "/health");
    assert.equal(entry.statusCode, 200);
    assert.equal(typeof entry.durationMs, "number");
    assert.equal(logs[0].includes("secret@example.com"), false);
  } finally {
    server.close();
  }
});

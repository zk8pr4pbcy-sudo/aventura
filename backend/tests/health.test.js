import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import { createServer } from "../src/server.js";

test("GET /health reports the backend as healthy", async (t) => {
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend"
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    service: "aventura-backend",
    environment: "test"
  });
});

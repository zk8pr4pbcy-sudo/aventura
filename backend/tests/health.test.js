import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import { createServer } from "../src/server.js";

async function withServer(dependencies, fn) {
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend"
  }, dependencies);

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("GET /health reports process liveness without requiring database readiness", async () => {
  await withServer({}, async (base) => {
    const response = await fetch(`${base}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      ok: true,
      service: "aventura-backend",
      environment: "test"
    });
  });
});

test("GET /ready reports readiness only after database check succeeds", async () => {
  await withServer({
    readiness: {
      check: async () => ({ database: "ok" })
    }
  }, async (base) => {
    const response = await fetch(`${base}/ready`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      checks: { database: "ok" }
    });
  });
});

test("GET /ready fails closed when database readiness is unavailable", async () => {
  await withServer({}, async (base) => {
    const response = await fetch(`${base}/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: "service_unavailable"
    });
  });
});

test("GET /ready returns 503 when database check fails", async () => {
  await withServer({
    readiness: {
      check: async () => {
        throw new Error("database unavailable");
      }
    }
  }, async (base) => {
    const response = await fetch(`${base}/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: "service_unavailable"
    });
  });
});

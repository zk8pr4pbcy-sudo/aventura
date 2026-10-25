import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

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

test("authenticated viewer can read dashboard summary", async () => {
  await withServer({
    auth: {
      async authenticate() {
        return {
          id: "22222222-2222-4222-8222-222222222222",
          email: "viewer@aventura.test",
          displayName: "Viewer",
          role: "viewer",
          isActive: true
        };
      }
    },
    adminDashboard: {
      async getSummary() {
        return {
          totals: { all: 1, active: 1, new: 1, experience: 1, collaboration: 0 },
          byStatus: { new: 1 },
          recentRequests: []
        };
      }
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/admin/dashboard/summary`, {
      headers: { cookie: COOKIE }
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).summary.totals.new, 1);
  });
});

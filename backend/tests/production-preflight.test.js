import assert from "node:assert/strict";
import test from "node:test";
import { listExpectedMigrations, verifyProductionDatabase } from "../src/database/preflight.js";

test("production preflight verifies database connectivity and all migrations", async () => {
  const expected = await listExpectedMigrations();
  let calls = 0;
  const result = await verifyProductionDatabase({
    async query(sql) {
      calls += 1;
      if (sql === "SELECT 1") return { rows: [{ "?column?": 1 }] };
      return { rows: expected.map((filename) => ({ filename })) };
    }
  });

  assert.equal(calls, 2);
  assert.deepEqual(result, { database: "ok", migrations: expected.length });
});

test("production preflight rejects a database with unapplied migrations", async () => {
  const expected = await listExpectedMigrations();
  assert.ok(expected.length > 0);

  await assert.rejects(
    verifyProductionDatabase({
      async query(sql) {
        if (sql === "SELECT 1") return { rows: [{ "?column?": 1 }] };
        return { rows: expected.slice(0, -1).map((filename) => ({ filename })) };
      }
    }),
    new RegExp(expected.at(-1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
});

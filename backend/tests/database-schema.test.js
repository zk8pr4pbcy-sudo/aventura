import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schemaUrl = new URL("../database/migrations/001_initial_schema.sql", import.meta.url);
const refsUrl = new URL("../database/migrations/002_reference_numbers.sql", import.meta.url);

test("initial schema contains required Aventura management tables", async () => {
  const sql = await readFile(schemaUrl, "utf8");
  for (const table of [
    "users",
    "customers",
    "experience_requests",
    "collaboration_requests",
    "request_status_history",
    "internal_notes",
    "website_content",
    "audit_log"
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE ${table} \\\(`));
  }
});

test("public references are separate from UUID primary keys", async () => {
  const schema = await readFile(schemaUrl, "utf8");
  const refs = await readFile(refsUrl, "utf8");
  assert.match(schema, /id uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
  assert.match(schema, /reference_number text NOT NULL UNIQUE/);
  assert.match(refs, /AV-/);
  assert.match(refs, /'EXP'/);
  assert.match(refs, /'COL'/);
});

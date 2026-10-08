import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMigrationSql } from "../src/database/migrate.js";

test("migration runner removes only an outer BEGIN/COMMIT wrapper", () => {
  const sql = `\nBEGIN;\nCREATE TABLE example(id integer);\nCOMMIT;\n`;
  assert.equal(normalizeMigrationSql(sql), "CREATE TABLE example(id integer);");
});

test("migration runner leaves unwrapped SQL intact", () => {
  const sql = "CREATE TABLE example(id integer);";
  assert.equal(normalizeMigrationSql(sql), sql);
});

test("migration runner does not strip transaction words inside SQL bodies", () => {
  const sql = `CREATE FUNCTION example() RETURNS void AS $$ BEGIN RETURN; END; $$ LANGUAGE plpgsql;`;
  assert.equal(normalizeMigrationSql(sql), sql);
});

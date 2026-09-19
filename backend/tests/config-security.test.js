import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";

const productionDatabaseUrl = "postgresql://aventura:secret@db.example:5432/aventura";

test("production requires an explicit PostgreSQL connection", () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: "production", PORT: "3000" }),
    /DATABASE_URL is required in production/
  );
});

test("production disables public request ingestion by default", () => {
  const config = loadConfig({
    NODE_ENV: "production",
    PORT: "3000",
    DATABASE_URL: productionDatabaseUrl
  });
  assert.equal(config.publicRequestsEnabled, false);
  assert.equal(config.turnstile.required, false);
});

test("production public requests require Turnstile secret and approved hostnames", () => {
  assert.throws(
    () => loadConfig({
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: productionDatabaseUrl,
      PUBLIC_REQUESTS_ENABLED: "true"
    }),
    /TURNSTILE_SECRET_KEY/
  );

  assert.throws(
    () => loadConfig({
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: productionDatabaseUrl,
      PUBLIC_REQUESTS_ENABLED: "true",
      TURNSTILE_SECRET_KEY: "secret"
    }),
    /TURNSTILE_HOSTNAMES/
  );

  const config = loadConfig({
    NODE_ENV: "production",
    PORT: "3000",
    DATABASE_URL: productionDatabaseUrl,
    PUBLIC_REQUESTS_ENABLED: "true",
    TURNSTILE_SECRET_KEY: "secret",
    TURNSTILE_HOSTNAMES: "aventuraksa.com, www.aventuraksa.com"
  });
  assert.equal(config.publicRequestsEnabled, true);
  assert.equal(config.turnstile.required, true);
  assert.deepEqual(config.turnstile.hostnames, ["aventuraksa.com", "www.aventuraksa.com"]);
});

test("invalid boolean security settings fail closed", () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: "development", PUBLIC_REQUESTS_ENABLED: "yes" }),
    /PUBLIC_REQUESTS_ENABLED must be true or false/
  );
  assert.throws(
    () => loadConfig({ NODE_ENV: "development", TURNSTILE_REQUIRED: "1" }),
    /TURNSTILE_REQUIRED must be true or false/
  );
});

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
  assert.equal(config.idempotencyRequired, false);
  assert.equal(config.turnstile.required, false);
  assert.deepEqual(config.publicApiOrigins, []);
  assert.equal(config.trustedClientIpHeader, null);
});

test("production cannot enable public requests while disabling Turnstile", () => {
  assert.throws(
    () => loadConfig({
      NODE_ENV: "production",
      DATABASE_URL: productionDatabaseUrl,
      PUBLIC_REQUESTS_ENABLED: "true",
      TURNSTILE_REQUIRED: "false"
    }),
    /TURNSTILE_REQUIRED must be true/
  );
});

test("production public requests require Turnstile secret, approved hostnames and explicit origins", () => {
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

  assert.throws(
    () => loadConfig({
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: productionDatabaseUrl,
      PUBLIC_REQUESTS_ENABLED: "true",
      TURNSTILE_SECRET_KEY: "secret",
      TURNSTILE_HOSTNAMES: "aventuraksa.com, www.aventuraksa.com"
    }),
    /PUBLIC_API_ORIGINS/
  );

  const config = loadConfig({
    NODE_ENV: "production",
    PORT: "3000",
    DATABASE_URL: productionDatabaseUrl,
    PUBLIC_REQUESTS_ENABLED: "true",
    TURNSTILE_SECRET_KEY: "secret",
    TURNSTILE_HOSTNAMES: "aventuraksa.com, www.aventuraksa.com",
    PUBLIC_API_ORIGINS: "https://aventuraksa.com,https://www.aventuraksa.com",
    TRUSTED_CLIENT_IP_HEADER: "cf-connecting-ip"
  });
  assert.equal(config.publicRequestsEnabled, true);
  assert.equal(config.idempotencyRequired, true);
  assert.equal(config.turnstile.required, true);
  assert.deepEqual(config.turnstile.hostnames, ["aventuraksa.com", "www.aventuraksa.com"]);
  assert.deepEqual(config.publicApiOrigins, ["https://aventuraksa.com", "https://www.aventuraksa.com"]);
  assert.equal(config.trustedClientIpHeader, "cf-connecting-ip");
});

test("invalid origin and trusted client IP settings fail closed", () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: "development", PUBLIC_API_ORIGINS: "http://aventuraksa.com" }),
    /HTTPS origins/
  );
  assert.throws(
    () => loadConfig({ NODE_ENV: "development", TRUSTED_CLIENT_IP_HEADER: "client-ip" }),
    /TRUSTED_CLIENT_IP_HEADER/
  );
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

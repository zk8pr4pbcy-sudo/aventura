import assert from "node:assert/strict";
import test from "node:test";
import { enforceTurnstile, readTurnstileToken, verifyTurnstileToken } from "../src/security/turnstile.js";

test("Turnstile accepts a valid token with expected action and hostname", async () => {
  let request;
  const result = await verifyTurnstileToken({
    secretKey: "test-secret",
    token: "valid-token",
    expectedAction: "experience_request",
    expectedHostnames: ["aventuraksa.com", "www.aventuraksa.com"],
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        async json() {
          return {
            success: true,
            action: "experience_request",
            hostname: "aventuraksa.com",
            challenge_ts: "2026-09-19T02:00:00Z"
          };
        }
      };
    }
  });

  assert.equal(result.success, true);
  assert.match(request.url, /turnstile\/v0\/siteverify$/);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.body.get("secret"), "test-secret");
  assert.equal(request.options.body.get("response"), "valid-token");
  assert.ok(request.options.body.get("idempotency_key"));
});

test("Turnstile rejects action and hostname mismatches", async () => {
  const fetchImpl = async () => ({
    ok: true,
    async json() {
      return { success: true, action: "wrong_action", hostname: "example.com" };
    }
  });

  await assert.rejects(
    verifyTurnstileToken({
      secretKey: "test-secret",
      token: "valid-token",
      expectedAction: "experience_request",
      expectedHostnames: ["aventuraksa.com"],
      fetchImpl
    }),
    (error) => error.message === "turnstile_failed" && error.statusCode === 403
  );
});

test("Turnstile rejects missing and oversized tokens before network access", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    throw new Error("must_not_call");
  };

  await assert.rejects(
    verifyTurnstileToken({ secretKey: "test-secret", token: "", fetchImpl }),
    /turnstile_failed/
  );
  await assert.rejects(
    verifyTurnstileToken({ secretKey: "test-secret", token: "x".repeat(2049), fetchImpl }),
    /turnstile_failed/
  );
  assert.equal(called, false);
});

test("Turnstile is a no-op until the production gate is enabled", async () => {
  const result = await enforceTurnstile({
    payload: {},
    config: { required: false },
    expectedAction: "experience_request",
    verifier: async () => { throw new Error("must_not_call"); }
  });
  assert.deepEqual(result, { required: false });
});

test("Turnstile reads both explicit and Cloudflare standard token fields", () => {
  assert.equal(readTurnstileToken({ turnstileToken: " one " }), "one");
  assert.equal(readTurnstileToken({ "cf-turnstile-response": " two " }), "two");
});

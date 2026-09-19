import assert from "node:assert/strict";
import test from "node:test";
import { createLoginFailureLimiter } from "../src/security/login-rate-limit.js";

test("login limiter blocks repeated failures by account and reports retry delay", () => {
  let time = Date.parse("2026-09-19T02:00:00Z");
  const limiter = createLoginFailureLimiter({
    windowMs: 60_000,
    accountLimit: 2,
    ipLimit: 10,
    now: () => time
  });
  const attempt = { email: "OWNER@EXAMPLE.COM", ip: "127.0.0.1" };

  limiter.assertAllowed(attempt);
  limiter.recordFailure(attempt);
  limiter.assertAllowed(attempt);
  time += 1_000;
  limiter.recordFailure(attempt);

  assert.throws(
    () => limiter.assertAllowed({ email: "owner@example.com", ip: "127.0.0.2" }),
    (error) => error.statusCode === 429 && error.message === "too_many_login_attempts" && error.retryAfterSeconds === 59
  );

  time += 60_000;
  assert.doesNotThrow(() => limiter.assertAllowed(attempt));
});

test("successful login clears account failures without pretending to clear IP history", () => {
  const limiter = createLoginFailureLimiter({ accountLimit: 1, ipLimit: 2 });
  const first = { email: "owner@example.com", ip: "127.0.0.1" };
  limiter.recordFailure(first);
  limiter.recordSuccess(first);

  assert.doesNotThrow(() => limiter.assertAllowed({ email: "owner@example.com", ip: "127.0.0.2" }));
  limiter.recordFailure({ email: "another@example.com", ip: "127.0.0.1" });
  assert.throws(
    () => limiter.assertAllowed({ email: "third@example.com", ip: "127.0.0.1" }),
    /too_many_login_attempts/
  );
});

test("missing trusted IP does not create one shared limiter bucket", () => {
  const limiter = createLoginFailureLimiter({ accountLimit: 1, ipLimit: 1 });
  limiter.recordFailure({ email: "first@example.com", ip: null });

  assert.throws(
    () => limiter.assertAllowed({ email: "first@example.com", ip: null }),
    /too_many_login_attempts/
  );
  assert.doesNotThrow(
    () => limiter.assertAllowed({ email: "second@example.com", ip: null })
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTrustedClientIpHeader, resolveClientIp } from "../src/security/client-ip.js";

test("client IP resolver ignores proxy headers unless explicitly configured", () => {
  const req = {
    headers: {
      "cf-connecting-ip": "198.51.100.10",
      "x-forwarded-for": "203.0.113.5, 10.0.0.1"
    },
    socket: { remoteAddress: "10.0.0.2" }
  };

  assert.equal(resolveClientIp(req, null), null);
  assert.equal(resolveClientIp(req, "cf-connecting-ip"), "198.51.100.10");
  assert.equal(resolveClientIp(req, "x-forwarded-for"), "203.0.113.5");
  assert.equal(resolveClientIp(req, "remote-address"), "10.0.0.2");
});

test("trusted client IP header accepts only explicit supported modes", () => {
  assert.equal(normalizeTrustedClientIpHeader("CF-Connecting-IP"), "cf-connecting-ip");
  assert.throws(() => normalizeTrustedClientIpHeader("x-real-ip"), /TRUSTED_CLIENT_IP_HEADER/);
});

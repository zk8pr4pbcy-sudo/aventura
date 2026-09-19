import assert from "node:assert/strict";
import test from "node:test";
import { createIdempotencyMetadata, readIdempotencyKey } from "../src/security/idempotency.js";

const key = "123e4567-e89b-42d3-a456-426614174000";
const experience = {
  fullName: "Aventura Guest",
  email: null,
  phone: "+966500000000",
  experienceKey: "historic-jeddah",
  language: "ar",
  partySize: 2,
  requestedDate: null
};

test("required idempotency key accepts UUID v4 and rejects missing or malformed values", () => {
  assert.equal(
    readIdempotencyKey({ headers: { "idempotency-key": key.toUpperCase() } }, { required: true }),
    key
  );
  assert.throws(
    () => readIdempotencyKey({ headers: {} }, { required: true }),
    (error) => error.statusCode === 400 && error.message === "idempotency_key_required"
  );
  assert.throws(
    () => readIdempotencyKey({ headers: { "idempotency-key": "not-a-uuid" } }, { required: true }),
    (error) => error.statusCode === 400 && error.message === "invalid_idempotency_key"
  );
});

test("idempotency metadata hashes keys and produces stable request fingerprints", () => {
  const first = createIdempotencyMetadata("experience", experience, key);
  const second = createIdempotencyMetadata("experience", { ...experience }, key);
  const changed = createIdempotencyMetadata("experience", { ...experience, partySize: 3 }, key);

  assert.match(first.idempotencyKeyHash, /^[0-9a-f]{64}$/);
  assert.match(first.idempotencyFingerprint, /^[0-9a-f]{64}$/);
  assert.deepEqual(first, second);
  assert.equal(first.idempotencyKeyHash, changed.idempotencyKeyHash);
  assert.notEqual(first.idempotencyFingerprint, changed.idempotencyFingerprint);
});

test("optional idempotency leaves internal metadata empty when no key is supplied", () => {
  assert.deepEqual(
    createIdempotencyMetadata("experience", experience, null),
    { idempotencyKeyHash: null, idempotencyFingerprint: null }
  );
});

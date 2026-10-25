import { createHash } from "node:crypto";

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function readIdempotencyKey(req, { required = false } = {}) {
  const raw = req.headers?.["idempotency-key"];
  const key = Array.isArray(raw) ? raw[0] : raw;

  if (key == null || key === "") {
    if (required) throw httpError("idempotency_key_required", 400);
    return null;
  }
  if (typeof key !== "string" || !UUID_V4_PATTERN.test(key.trim())) {
    throw httpError("invalid_idempotency_key", 400);
  }
  return key.trim().toLowerCase();
}

export function createIdempotencyMetadata(kind, input, key) {
  if (!key) return { idempotencyKeyHash: null, idempotencyFingerprint: null };

  let fields;
  if (kind === "experience") {
    fields = [
      input.fullName,
      input.email,
      input.phone,
      input.experienceKey,
      input.language,
      input.partySize,
      input.requestedDate
    ];
  } else if (kind === "collaboration") {
    fields = [
      input.fullName,
      input.email,
      input.phone,
      input.language,
      input.organizationName,
      input.collaborationType,
      input.proposal
    ];
  } else {
    throw new Error("unsupported idempotency request kind");
  }

  return {
    idempotencyKeyHash: sha256(key),
    idempotencyFingerprint: sha256(JSON.stringify([kind, ...fields]))
  };
}

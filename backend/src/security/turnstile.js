import { randomUUID } from "node:crypto";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;

function securityError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeToken(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function readTurnstileToken(payload = {}) {
  return normalizeToken(payload.turnstileToken || payload["cf-turnstile-response"]);
}

export async function verifyTurnstileToken({
  secretKey,
  token,
  expectedAction,
  expectedHostnames = [],
  fetchImpl = fetch,
  timeoutMs = 5000
}) {
  const normalizedToken = normalizeToken(token);
  if (!secretKey) throw securityError("turnstile_not_configured", 503);
  if (!normalizedToken || normalizedToken.length > MAX_TOKEN_LENGTH) {
    throw securityError("turnstile_failed", 403);
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: normalizedToken,
    idempotency_key: randomUUID()
  });

  let response;
  try {
    response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch {
    throw securityError("turnstile_unavailable", 503);
  }

  if (!response.ok) throw securityError("turnstile_unavailable", 503);

  let result;
  try {
    result = await response.json();
  } catch {
    throw securityError("turnstile_unavailable", 503);
  }

  if (!result?.success) throw securityError("turnstile_failed", 403);
  if (expectedAction && result.action !== expectedAction) {
    throw securityError("turnstile_failed", 403);
  }

  const hostnames = new Set(expectedHostnames.map((value) => String(value).toLowerCase()));
  if (hostnames.size && !hostnames.has(String(result.hostname || "").toLowerCase())) {
    throw securityError("turnstile_failed", 403);
  }

  return {
    success: true,
    action: result.action || null,
    hostname: result.hostname || null,
    challengeTs: result.challenge_ts || null
  };
}

export async function enforceTurnstile({ payload, config, expectedAction, verifier = verifyTurnstileToken }) {
  if (!config?.required) return { required: false };
  const result = await verifier({
    secretKey: config.secretKey,
    token: readTurnstileToken(payload),
    expectedAction,
    expectedHostnames: config.hostnames || []
  });
  return { required: true, ...result };
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeIp(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "unknown";
}

function rateLimitError(retryAfterSeconds) {
  const error = new Error("too_many_login_attempts");
  error.statusCode = 429;
  error.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  return error;
}

export function createLoginFailureLimiter(options = {}) {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const accountLimit = options.accountLimit ?? 8;
  const ipLimit = options.ipLimit ?? 30;
  const now = options.now || (() => Date.now());
  const accountFailures = new Map();
  const ipFailures = new Map();

  function prune(map, key, timestamp) {
    const current = map.get(key) || [];
    const cutoff = timestamp - windowMs;
    const active = current.filter((time) => time > cutoff);
    if (active.length) map.set(key, active);
    else map.delete(key);
    return active;
  }

  function assertBucket(map, key, limit, timestamp) {
    const active = prune(map, key, timestamp);
    if (active.length < limit) return;
    const retryAt = active[0] + windowMs;
    throw rateLimitError((retryAt - timestamp) / 1000);
  }

  function addFailure(map, key, timestamp) {
    const active = prune(map, key, timestamp);
    active.push(timestamp);
    map.set(key, active);
  }

  return {
    assertAllowed({ email, ip }) {
      const timestamp = now();
      const accountKey = normalizeEmail(email);
      const ipKey = normalizeIp(ip);
      if (accountKey) assertBucket(accountFailures, accountKey, accountLimit, timestamp);
      assertBucket(ipFailures, ipKey, ipLimit, timestamp);
    },

    recordFailure({ email, ip }) {
      const timestamp = now();
      const accountKey = normalizeEmail(email);
      const ipKey = normalizeIp(ip);
      if (accountKey) addFailure(accountFailures, accountKey, timestamp);
      addFailure(ipFailures, ipKey, timestamp);
    },

    recordSuccess({ email }) {
      const accountKey = normalizeEmail(email);
      if (accountKey) accountFailures.delete(accountKey);
    }
  };
}

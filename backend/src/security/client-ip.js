const TRUSTED_HEADERS = new Set(["cf-connecting-ip", "x-forwarded-for", "remote-address"]);

export function normalizeTrustedClientIpHeader(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!TRUSTED_HEADERS.has(normalized)) {
    throw new Error("TRUSTED_CLIENT_IP_HEADER must be cf-connecting-ip, x-forwarded-for, or remote-address");
  }
  return normalized;
}

export function resolveClientIp(req, trustedHeader) {
  if (!trustedHeader) return null;
  if (trustedHeader === "remote-address") {
    return req.socket?.remoteAddress || null;
  }

  const raw = req.headers?.[trustedHeader];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || !value.trim()) return null;

  if (trustedHeader === "x-forwarded-for") {
    return value.split(",")[0].trim() || null;
  }
  return value.trim();
}

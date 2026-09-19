export function normalizeOrigins(value) {
  if (!value) return [];
  const origins = [];
  for (const item of String(value).split(",")) {
    const candidate = item.trim();
    if (!candidate) continue;
    let url;
    try {
      url = new URL(candidate);
    } catch {
      throw new Error("PUBLIC_API_ORIGINS contains an invalid origin");
    }
    if (url.protocol !== "https:" || url.origin !== candidate.replace(/\/$/, "")) {
      throw new Error("PUBLIC_API_ORIGINS must contain HTTPS origins without paths");
    }
    origins.push(url.origin);
  }
  return [...new Set(origins)];
}

function setCorsHeaders(res, origin) {
  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("vary", "Origin");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "Content-Type");
  res.setHeader("access-control-max-age", "600");
}

export function applyPublicCors(req, res, allowedOrigins) {
  const origin = typeof req.headers?.origin === "string" ? req.headers.origin : null;
  if (!origin) {
    return { allowed: true, handled: false };
  }

  if (!allowedOrigins.includes(origin)) {
    return { allowed: false, handled: false };
  }

  setCorsHeaders(res, origin);
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "cache-control": "no-store" });
    res.end();
    return { allowed: true, handled: true };
  }

  return { allowed: true, handled: false };
}

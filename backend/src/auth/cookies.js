export const ADMIN_SESSION_COOKIE = "aventura_admin_session";

export function readAdminSessionCookie(req) {
  const header = req.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const name = part.slice(0, index).trim();
    if (name !== ADMIN_SESSION_COOKIE) continue;
    const value = part.slice(index + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

export function createAdminSessionCookie(token, { secure = true, maxAgeSeconds = 8 * 60 * 60 } = {}) {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/api/v1/admin",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

export function clearAdminSessionCookie({ secure = true } = {}) {
  return createAdminSessionCookie("", { secure, maxAgeSeconds: 0 });
}

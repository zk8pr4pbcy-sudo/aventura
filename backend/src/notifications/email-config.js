function parseBoolean(value, name) {
  if (value == null || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function parsePort(value, secure) {
  if (value == null || value === "") return secure ? 465 : 587;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535");
  }
  return port;
}

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function loadEmailConfig(env = process.env) {
  const touched = [
    env.SMTP_HOST,
    env.SMTP_PORT,
    env.SMTP_SECURE,
    env.SMTP_USER,
    env.SMTP_PASS,
    env.SMTP_FROM,
    env.OPERATIONS_NOTIFICATION_EMAIL
  ].some((value) => value != null && value !== "");

  if (!touched) return null;

  const host = env.SMTP_HOST?.trim();
  const from = env.SMTP_FROM?.trim();
  const operationsEmail = env.OPERATIONS_NOTIFICATION_EMAIL?.trim();
  const secure = parseBoolean(env.SMTP_SECURE, "SMTP_SECURE") ?? false;

  if (!host) throw new Error("SMTP_HOST is required when email is configured");
  if (!from) throw new Error("SMTP_FROM is required when email is configured");
  if (!isEmail(operationsEmail)) {
    throw new Error("OPERATIONS_NOTIFICATION_EMAIL must be a valid email address");
  }

  const user = env.SMTP_USER?.trim() || null;
  const password = env.SMTP_PASS || null;
  if (Boolean(user) !== Boolean(password)) {
    throw new Error("SMTP_USER and SMTP_PASS must be configured together");
  }

  return {
    host,
    port: parsePort(env.SMTP_PORT, secure),
    secure,
    auth: user ? { user, password } : null,
    from,
    operationsEmail
  };
}

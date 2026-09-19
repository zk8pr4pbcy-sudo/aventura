const DEFAULT_PORT = 3000;

function parseBoolean(value, fallback, name) {
  if (value == null || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function parseHostnames(value) {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export function loadConfig(env = process.env) {
  const port = Number(env.PORT || DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  const nodeEnv = env.NODE_ENV || "development";
  const databaseUrl = env.DATABASE_URL || null;
  const publicRequestsEnabled = parseBoolean(
    env.PUBLIC_REQUESTS_ENABLED,
    nodeEnv !== "production",
    "PUBLIC_REQUESTS_ENABLED"
  );
  const turnstileRequired = parseBoolean(
    env.TURNSTILE_REQUIRED,
    nodeEnv === "production" && publicRequestsEnabled,
    "TURNSTILE_REQUIRED"
  );
  const turnstileSecretKey = env.TURNSTILE_SECRET_KEY || null;
  const turnstileHostnames = parseHostnames(env.TURNSTILE_HOSTNAMES);

  if (nodeEnv === "production" && !databaseUrl) {
    throw new Error("DATABASE_URL is required in production");
  }
  if (turnstileRequired && !turnstileSecretKey) {
    throw new Error("TURNSTILE_SECRET_KEY is required when Turnstile validation is enabled");
  }
  if (nodeEnv === "production" && turnstileRequired && turnstileHostnames.length === 0) {
    throw new Error("TURNSTILE_HOSTNAMES is required for production public requests");
  }

  return {
    env: nodeEnv,
    port,
    serviceName: "aventura-backend",
    databaseUrl,
    publicRequestsEnabled,
    turnstile: {
      required: turnstileRequired,
      secretKey: turnstileSecretKey,
      hostnames: turnstileHostnames
    }
  };
}

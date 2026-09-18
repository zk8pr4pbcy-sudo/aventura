const DEFAULT_PORT = 3000;

export function loadConfig(env = process.env) {
  const port = Number(env.PORT || DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return {
    env: env.NODE_ENV || "development",
    port,
    serviceName: "aventura-backend",
    databaseUrl: env.DATABASE_URL || null
  };
}

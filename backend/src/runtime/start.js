import { loadConfig } from "../config.js";
import { createDatabaseDependencies } from "../database/dependencies.js";
import { createServer } from "../server.js";
import { createGracefulShutdown } from "./graceful-shutdown.js";

const config = loadConfig();
const database = createDatabaseDependencies(config);
const server = createServer(config, database.dependencies);

server.listen(config.port, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "info",
    event: "server_started",
    service: config.serviceName,
    environment: config.env,
    port: config.port
  }));
});

const shutdown = createGracefulShutdown({
  server,
  closeDatabase: database.close,
  timeoutMs: 10_000
});

process.once("SIGTERM", () => {
  void shutdown();
});
process.once("SIGINT", () => {
  void shutdown();
});

import { loadConfig } from "../src/config.js";
import { createDatabasePool } from "../src/database/pool.js";
import { verifyProductionDatabase } from "../src/database/preflight.js";

const config = loadConfig();
if (config.env !== "production") {
  throw new Error("production:preflight requires NODE_ENV=production");
}

const pool = createDatabasePool(config.databaseUrl);
try {
  const result = await verifyProductionDatabase(pool);
  console.log(`Production preflight passed: database=${result.database}, migrations=${result.migrations}`);
} finally {
  await pool.end();
}

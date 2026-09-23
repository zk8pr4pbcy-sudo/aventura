export function createDatabaseReadiness(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async check() {
      await pool.query("SELECT 1");
      return { database: "ok" };
    }
  };
}

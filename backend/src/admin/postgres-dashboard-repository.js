export function createPostgresAdminDashboardRepository(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async getCounts() {
      const result = await pool.query(`
        SELECT kind, status, count(*)::int AS count
        FROM (
          SELECT 'experience'::text AS kind, status FROM experience_requests
          UNION ALL
          SELECT 'collaboration'::text AS kind, status FROM collaboration_requests
        ) AS all_requests
        GROUP BY kind, status
        ORDER BY kind, status
      `);
      return result.rows;
    }
  };
}

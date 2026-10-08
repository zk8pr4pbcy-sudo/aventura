export function createPostgresAuthRepository(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async findActiveUserByEmail(email) {
      const result = await pool.query(
        `SELECT id, email, display_name, role, is_active, password_hash
         FROM users
         WHERE lower(email) = lower($1) AND is_active = true
         LIMIT 1`,
        [email]
      );
      if (!result.rowCount) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        isActive: row.is_active,
        passwordHash: row.password_hash
      };
    },

    async createSession({ userId, tokenHash, expiresAt }) {
      const result = await pool.query(
        `INSERT INTO admin_sessions (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id, expires_at`,
        [userId, tokenHash, expiresAt]
      );
      return { id: result.rows[0].id, expiresAt: result.rows[0].expires_at };
    },

    async findSessionByTokenHash(tokenHash) {
      const result = await pool.query(
        `SELECT s.id AS session_id, s.expires_at, s.revoked_at,
                u.id, u.email, u.display_name, u.role, u.is_active
         FROM admin_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1
         LIMIT 1`,
        [tokenHash]
      );
      if (!result.rowCount) return null;
      const row = result.rows[0];
      return {
        sessionId: row.session_id,
        expiresAt: row.expires_at,
        revokedAt: row.revoked_at,
        user: {
          id: row.id,
          email: row.email,
          displayName: row.display_name,
          role: row.role,
          isActive: row.is_active
        }
      };
    },

    async touchSession(sessionId) {
      await pool.query(
        "UPDATE admin_sessions SET last_seen_at = now() WHERE id = $1",
        [sessionId]
      );
    },

    async revokeSession(tokenHash) {
      await pool.query(
        `UPDATE admin_sessions
         SET revoked_at = COALESCE(revoked_at, now())
         WHERE token_hash = $1`,
        [tokenHash]
      );
    }
  };
}

import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { hashPassword } from "../src/auth/password.js";
import { createPostgresAuthRepository } from "../src/auth/postgres-repository.js";
import { createAuthService } from "../src/auth/service.js";

const databaseUrl = process.env.DATABASE_URL;

test("admin login creates a hashed database session and logout revokes it", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  const email = "auth-ci@aventura.test";
  const password = "Aventura-CI-Admin-Password-2026!";

  try {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
    const passwordHash = await hashPassword(password);
    await pool.query(
      `INSERT INTO users (email, display_name, role, password_hash, password_changed_at)
       VALUES ($1, 'CI Admin', 'admin', $2, now())`,
      [email, passwordHash]
    );

    const service = createAuthService(createPostgresAuthRepository(pool), {
      sessionTtlMs: 60_000
    });
    const login = await service.login({ email, password });
    assert.equal(login.user.role, "admin");
    assert.equal(login.user.passwordHash, undefined);

    const sessionRows = await pool.query(
      `SELECT token_hash, revoked_at FROM admin_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE u.email = $1`,
      [email]
    );
    assert.equal(sessionRows.rowCount, 1);
    assert.notEqual(sessionRows.rows[0].token_hash, login.token);
    assert.equal(sessionRows.rows[0].revoked_at, null);

    const authenticated = await service.authenticate(login.token);
    assert.equal(authenticated.email, email);

    await service.logout(login.token);
    await assert.rejects(service.authenticate(login.token), /invalid_credentials/);
  } finally {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
    await pool.end();
  }
});

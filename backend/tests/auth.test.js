import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/auth/password.js";
import { createAuthService } from "../src/auth/service.js";
import { hasPermission, requirePermission } from "../src/auth/permissions.js";

test("password hashing verifies correct password and rejects wrong password", async () => {
  const hash = await hashPassword("Aventura-Test-Password-2026!");
  assert.equal(await verifyPassword("Aventura-Test-Password-2026!", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
  assert.notEqual(hash, "Aventura-Test-Password-2026!");
});

test("password policy rejects short passwords", async () => {
  await assert.rejects(hashPassword("short"), /password_policy_failed/);
});

test("roles enforce least privilege", () => {
  assert.equal(hasPermission("operations", "requests:update"), true);
  assert.equal(hasPermission("operations", "content:manage"), false);
  assert.equal(hasPermission("content", "content:manage"), true);
  assert.equal(hasPermission("viewer", "requests:update"), false);
  assert.throws(
    () => requirePermission({ role: "viewer", isActive: true }, "requests:update"),
    /forbidden/
  );
});

test("auth service never returns stored password hash", async () => {
  const passwordHash = await hashPassword("Aventura-Test-Password-2026!");
  let storedTokenHash;
  const repository = {
    async findActiveUserByEmail() {
      return {
        id: "user-1",
        email: "admin@aventura.test",
        displayName: "Admin",
        role: "admin",
        isActive: true,
        passwordHash
      };
    },
    async createSession({ tokenHash, expiresAt }) {
      storedTokenHash = tokenHash;
      return { id: "session-1", expiresAt };
    },
    async findSessionByTokenHash(tokenHash) {
      assert.equal(tokenHash, storedTokenHash);
      return {
        sessionId: "session-1",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        user: {
          id: "user-1",
          email: "admin@aventura.test",
          displayName: "Admin",
          role: "admin",
          isActive: true
        }
      };
    },
    async touchSession() {},
    async revokeSession() {}
  };

  const service = createAuthService(repository);
  const result = await service.login({
    email: "admin@aventura.test",
    password: "Aventura-Test-Password-2026!"
  });
  assert.equal(typeof result.token, "string");
  assert.equal(result.user.passwordHash, undefined);
  assert.notEqual(storedTokenHash, result.token);

  const authenticated = await service.authenticate(result.token);
  assert.equal(authenticated.role, "admin");
});

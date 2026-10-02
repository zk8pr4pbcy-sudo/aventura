import { createHash, randomBytes } from "node:crypto";
import { verifyPassword } from "./password.js";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function invalidCredentials() {
  const error = new Error("invalid_credentials");
  error.statusCode = 401;
  return error;
}

export function createAuthService(repository, options = {}) {
  if (!repository || typeof repository.findActiveUserByEmail !== "function" || typeof repository.createSession !== "function" || typeof repository.findSessionByTokenHash !== "function") {
    throw new Error("auth repository is required");
  }

  const sessionTtlMs = options.sessionTtlMs ?? 8 * 60 * 60 * 1000;

  return {
    async login({ email, password }) {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!normalizedEmail || typeof password !== "string") throw invalidCredentials();

      const user = await repository.findActiveUserByEmail(normalizedEmail);
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
        throw invalidCredentials();
      }

      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + sessionTtlMs);
      const session = await repository.createSession({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt
      });

      return {
        token,
        expiresAt: session.expiresAt,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive
        }
      };
    },

    async authenticate(token) {
      if (typeof token !== "string" || token.length < 20) throw invalidCredentials();
      const session = await repository.findSessionByTokenHash(hashToken(token));
      const now = Date.now();
      if (!session || session.revokedAt || !session.user?.isActive || new Date(session.expiresAt).getTime() <= now) {
        throw invalidCredentials();
      }
      if (typeof repository.touchSession === "function") {
        await repository.touchSession(session.sessionId);
      }
      return session.user;
    },

    async logout(token) {
      if (typeof token === "string" && token.length >= 20 && typeof repository.revokeSession === "function") {
        await repository.revokeSession(hashToken(token));
      }
    }
  };
}

export { hashToken };

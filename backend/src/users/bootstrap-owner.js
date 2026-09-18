import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { createDatabasePool } from "../database/pool.js";
import { hashPassword } from "../auth/password.js";

export async function createInitialOwner(pool, { email, displayName, password }) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedName = typeof displayName === "string" ? displayName.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("ADMIN_EMAIL is invalid");
  }
  if (normalizedName.length < 2 || normalizedName.length > 120) {
    throw new Error("ADMIN_NAME is invalid");
  }

  const existing = await pool.query("SELECT 1 FROM users WHERE lower(email) = lower($1)", [normalizedEmail]);
  if (existing.rowCount) {
    throw new Error("owner_user_already_exists");
  }

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (email, display_name, role, password_hash, password_changed_at)
     VALUES ($1, $2, 'owner', $3, now())
     RETURNING id, email, display_name, role`,
    [normalizedEmail, normalizedName, passwordHash]
  );
  return result.rows[0];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error("DATABASE_URL is required");
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_NAME || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD are required");
  }

  const pool = createDatabasePool(config.databaseUrl);
  try {
    const owner = await createInitialOwner(pool, {
      email: process.env.ADMIN_EMAIL,
      displayName: process.env.ADMIN_NAME,
      password: process.env.ADMIN_PASSWORD
    });
    console.log(`Owner account created for ${owner.email}`);
  } finally {
    await pool.end();
  }
}

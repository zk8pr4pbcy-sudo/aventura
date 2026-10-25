BEGIN;

ALTER TABLE users
  ADD COLUMN password_hash text,
  ADD COLUMN password_changed_at timestamptz;

CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK (expires_at > created_at)
);

CREATE INDEX admin_sessions_user_active_idx
  ON admin_sessions(user_id, expires_at DESC)
  WHERE revoked_at IS NULL;

COMMIT;

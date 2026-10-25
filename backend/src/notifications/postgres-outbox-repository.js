const DEFAULT_MAX_ATTEMPTS = 8;
const STALE_LOCK_MINUTES = 15;

function mapEvent(row) {
  return {
    id: row.id,
    eventType: row.event_type,
    requestKind: row.request_kind,
    requestId: row.request_id,
    payload: row.payload,
    status: row.status,
    attempts: row.attempts,
    availableAt: row.available_at,
    lockedAt: row.locked_at,
    createdAt: row.created_at
  };
}

export function createPostgresNotificationOutboxRepository(pool, options = {}) {
  if (!pool || typeof pool.connect !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  return {
    async claimNext() {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `WITH candidate AS (
             SELECT id
             FROM notification_outbox
             WHERE attempts < $1
               AND (
                 (status IN ('pending', 'failed') AND available_at <= now())
                 OR
                 (status = 'processing' AND locked_at < now() - ($2::text || ' minutes')::interval)
               )
             ORDER BY available_at ASC, created_at ASC
             FOR UPDATE SKIP LOCKED
             LIMIT 1
           )
           UPDATE notification_outbox AS o
           SET status = 'processing',
               attempts = o.attempts + 1,
               locked_at = now(),
               updated_at = now()
           FROM candidate
           WHERE o.id = candidate.id
           RETURNING o.*`,
          [maxAttempts, STALE_LOCK_MINUTES]
        );
        await client.query("COMMIT");
        return result.rowCount ? mapEvent(result.rows[0]) : null;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async markSent(id) {
      const result = await pool.query(
        `UPDATE notification_outbox
         SET status = 'sent', sent_at = now(), locked_at = NULL,
             last_error = NULL, updated_at = now()
         WHERE id = $1 AND status = 'processing'
         RETURNING id`,
        [id]
      );
      return result.rowCount === 1;
    },

    async markFailed(id, errorMessage, retryAt) {
      const result = await pool.query(
        `UPDATE notification_outbox
         SET status = 'failed', available_at = $2, locked_at = NULL,
             last_error = $3, updated_at = now()
         WHERE id = $1 AND status = 'processing'
         RETURNING id`,
        [id, retryAt, String(errorMessage || "delivery_failed").slice(0, 2000)]
      );
      return result.rowCount === 1;
    }
  };
}

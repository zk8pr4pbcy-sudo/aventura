function requestTable(kind) {
  if (kind === "experience") return "experience_requests";
  if (kind === "collaboration") return "collaboration_requests";
  throw new Error("invalid_request_kind");
}

export function createPostgresRequestWorkflowRepository(pool) {
  if (!pool || typeof pool.connect !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async getStatus({ kind, requestId }) {
      const table = requestTable(kind);
      const result = await pool.query(`SELECT status FROM ${table} WHERE id = $1`, [requestId]);
      return result.rowCount ? result.rows[0].status : null;
    },

    async changeStatus({ kind, requestId, fromStatus, toStatus, actorUserId, note }) {
      const table = requestTable(kind);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const locked = await client.query(
          `SELECT status FROM ${table} WHERE id = $1 FOR UPDATE`,
          [requestId]
        );
        if (!locked.rowCount) {
          const error = new Error("request_not_found");
          error.statusCode = 404;
          throw error;
        }
        if (locked.rows[0].status !== fromStatus) {
          const error = new Error("request_status_changed");
          error.statusCode = 409;
          throw error;
        }

        await client.query(
          `UPDATE ${table} SET status = $1, updated_at = now() WHERE id = $2`,
          [toStatus, requestId]
        );
        await client.query(
          `INSERT INTO request_status_history
             (request_kind, request_id, from_status, to_status, changed_by, note)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [kind, requestId, fromStatus, toStatus, actorUserId, note]
        );
        await client.query("COMMIT");
        return { requestId, kind, previousStatus: fromStatus, status: toStatus };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async addNote({ kind, requestId, authorUserId, body }) {
      const table = requestTable(kind);
      const exists = await pool.query(`SELECT 1 FROM ${table} WHERE id = $1`, [requestId]);
      if (!exists.rowCount) {
        const error = new Error("request_not_found");
        error.statusCode = 404;
        throw error;
      }

      const result = await pool.query(
        `INSERT INTO internal_notes (request_kind, request_id, author_id, body)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [kind, requestId, authorUserId, body]
      );
      return {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      };
    }
  };
}

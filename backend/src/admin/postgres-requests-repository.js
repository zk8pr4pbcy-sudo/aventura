function sourceQuery(kind) {
  if (kind === "experience") {
    return `
      SELECT 'experience'::text AS kind,
             r.id, r.reference_number, r.status, r.created_at, r.updated_at,
             c.full_name, c.email, c.phone, c.preferred_language,
             jsonb_build_object(
               'experienceKey', r.experience_key,
               'requestedDate', r.requested_date,
               'partySize', r.party_size
             ) AS details
      FROM experience_requests r
      JOIN customers c ON c.id = r.customer_id
    `;
  }
  if (kind === "collaboration") {
    return `
      SELECT 'collaboration'::text AS kind,
             r.id, r.reference_number, r.status, r.created_at, r.updated_at,
             c.full_name, c.email, c.phone, c.preferred_language,
             jsonb_build_object(
               'organizationName', r.organization_name,
               'collaborationType', r.collaboration_type,
               'proposal', r.proposal
             ) AS details
      FROM collaboration_requests r
      JOIN customers c ON c.id = r.customer_id
    `;
  }
  return `(${sourceQuery("experience")}) UNION ALL (${sourceQuery("collaboration")})`;
}

function mapRequest(row) {
  return {
    kind: row.kind,
    id: row.id,
    referenceNumber: row.reference_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      preferredLanguage: row.preferred_language
    },
    details: row.details
  };
}

export function createPostgresAdminRequestsRepository(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async list({ kind, status, limit, before }) {
      const source = sourceQuery(kind);
      const result = await pool.query(
        `SELECT * FROM (${source}) AS requests
         WHERE ($1::request_status IS NULL OR status = $1::request_status)
           AND ($2::timestamptz IS NULL OR created_at < $2::timestamptz)
         ORDER BY created_at DESC, id DESC
         LIMIT $3`,
        [status, before, limit]
      );
      return result.rows.map(mapRequest);
    },

    async getById({ kind, requestId }) {
      const source = sourceQuery(kind);
      const result = await pool.query(
        `SELECT * FROM (${source}) AS request WHERE id = $1 LIMIT 1`,
        [requestId]
      );
      if (!result.rowCount) return null;

      const history = await pool.query(
        `SELECT h.id, h.from_status, h.to_status, h.changed_at, h.note,
                u.id AS user_id, u.display_name AS user_name
         FROM request_status_history h
         LEFT JOIN users u ON u.id = h.changed_by
         WHERE h.request_kind = $1 AND h.request_id = $2
         ORDER BY h.changed_at ASC, h.id ASC`,
        [kind, requestId]
      );
      const notes = await pool.query(
        `SELECT n.id, n.body, n.created_at,
                u.id AS user_id, u.display_name AS user_name
         FROM internal_notes n
         JOIN users u ON u.id = n.author_id
         WHERE n.request_kind = $1 AND n.request_id = $2
         ORDER BY n.created_at ASC, n.id ASC`,
        [kind, requestId]
      );

      return {
        ...mapRequest(result.rows[0]),
        statusHistory: history.rows.map((row) => ({
          id: row.id,
          fromStatus: row.from_status,
          toStatus: row.to_status,
          changedAt: row.changed_at,
          note: row.note,
          changedBy: row.user_id ? { id: row.user_id, displayName: row.user_name } : null
        })),
        internalNotes: notes.rows.map((row) => ({
          id: row.id,
          body: row.body,
          createdAt: row.created_at,
          author: { id: row.user_id, displayName: row.user_name }
        }))
      };
    }
  };
}

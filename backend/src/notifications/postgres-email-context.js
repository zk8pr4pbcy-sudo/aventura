function mapExperience(row) {
  return {
    kind: "experience",
    referenceNumber: row.reference_number,
    status: row.status,
    customer: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      preferredLanguage: row.preferred_language
    },
    details: {
      experienceKey: row.experience_key,
      requestedDate: row.requested_date,
      partySize: row.party_size
    },
    createdAt: row.created_at
  };
}

function mapCollaboration(row) {
  return {
    kind: "collaboration",
    referenceNumber: row.reference_number,
    status: row.status,
    customer: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      preferredLanguage: row.preferred_language
    },
    details: {
      organizationName: row.organization_name,
      collaborationType: row.collaboration_type,
      proposal: row.proposal
    },
    createdAt: row.created_at
  };
}

export function createPostgresEmailContextRepository(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async getRequest({ requestKind, requestId }) {
      if (requestKind === "experience") {
        const result = await pool.query(
          `SELECT r.reference_number, r.status, r.experience_key,
                  r.requested_date, r.party_size, r.created_at,
                  c.full_name, c.email, c.phone, c.preferred_language
           FROM experience_requests r
           JOIN customers c ON c.id = r.customer_id
           WHERE r.id = $1
           LIMIT 1`,
          [requestId]
        );
        return result.rowCount ? mapExperience(result.rows[0]) : null;
      }

      if (requestKind === "collaboration") {
        const result = await pool.query(
          `SELECT r.reference_number, r.status, r.organization_name,
                  r.collaboration_type, r.proposal, r.created_at,
                  c.full_name, c.email, c.phone, c.preferred_language
           FROM collaboration_requests r
           JOIN customers c ON c.id = r.customer_id
           WHERE r.id = $1
           LIMIT 1`,
          [requestId]
        );
        return result.rowCount ? mapCollaboration(result.rows[0]) : null;
      }

      throw new Error("unsupported_request_kind");
    }
  };
}

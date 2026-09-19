const TABLES = {
  experience: "experience_requests",
  collaboration: "collaboration_requests"
};

function reuseConflict() {
  const error = new Error("idempotency_key_reused");
  error.statusCode = 409;
  return error;
}

export async function lockIdempotencyKey(queryable, input) {
  if (!input.idempotencyKeyHash) return;
  await queryable.query(
    "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
    [input.idempotencyKeyHash]
  );
}

export async function findIdempotencyReplay(queryable, kind, input) {
  if (!input.idempotencyKeyHash) return null;
  const table = TABLES[kind];
  if (!table) throw new Error("unsupported idempotency request kind");

  const result = await queryable.query(
    `SELECT reference_number, status, idempotency_fingerprint
     FROM ${table}
     WHERE idempotency_key_hash = $1
     LIMIT 1`,
    [input.idempotencyKeyHash]
  );
  if (!result.rowCount) return null;

  const row = result.rows[0];
  if (row.idempotency_fingerprint !== input.idempotencyFingerprint) {
    throw reuseConflict();
  }

  return {
    referenceNumber: row.reference_number,
    status: row.status,
    replayed: true
  };
}

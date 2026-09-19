import { findIdempotencyReplay } from "../shared/postgres-idempotency.js";

export function createPostgresExperienceRequestRepository(pool) {
  if (!pool || typeof pool.connect !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async create(input) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const existing = await findIdempotencyReplay(client, "experience", input);
        if (existing) {
          await client.query("COMMIT");
          return existing;
        }

        const customer = await client.query(
          `INSERT INTO customers (full_name, email, phone, preferred_language)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [input.fullName, input.email, input.phone, input.language]
        );

        const request = await client.query(
          `INSERT INTO experience_requests
             (customer_id, experience_key, requested_date, party_size, request_payload,
              idempotency_key_hash, idempotency_fingerprint)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
           RETURNING id, reference_number, status`,
          [
            customer.rows[0].id,
            input.experienceKey,
            input.requestedDate,
            input.partySize,
            JSON.stringify({}),
            input.idempotencyKeyHash || null,
            input.idempotencyFingerprint || null
          ]
        );

        await client.query(
          `INSERT INTO notification_outbox
             (event_type, request_kind, request_id, payload)
           VALUES ($1, 'experience', $2, $3::jsonb)`,
          [
            "experience_request.created",
            request.rows[0].id,
            JSON.stringify({
              referenceNumber: request.rows[0].reference_number,
              preferredLanguage: input.language
            })
          ]
        );

        await client.query("COMMIT");
        return {
          referenceNumber: request.rows[0].reference_number,
          status: request.rows[0].status,
          replayed: false
        };
      } catch (error) {
        await client.query("ROLLBACK");
        if (input.idempotencyKeyHash && error?.code === "23505") {
          const replay = await findIdempotencyReplay(client, "experience", input);
          if (replay) return replay;
        }
        throw error;
      } finally {
        client.release();
      }
    }
  };
}

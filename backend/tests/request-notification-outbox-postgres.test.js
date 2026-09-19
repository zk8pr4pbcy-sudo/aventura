import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresExperienceRequestRepository } from "../src/experience-requests/postgres-repository.js";
import { createPostgresCollaborationRequestRepository } from "../src/collaboration-requests/postgres-repository.js";

const databaseUrl = process.env.DATABASE_URL;

async function findRequestAndEvent(pool, table, referenceNumber, eventType) {
  const result = await pool.query(
    `SELECT r.id AS request_id, r.customer_id, o.id AS event_id,
            o.status AS event_status, o.payload
     FROM ${table} r
     JOIN notification_outbox o ON o.request_id = r.id
     WHERE r.reference_number = $1 AND o.event_type = $2`,
    [referenceNumber, eventType]
  );
  return result.rows[0] || null;
}

test("experience and collaboration creation persist matching notification events", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  const created = [];

  try {
    const experience = await createPostgresExperienceRequestRepository(pool).create({
      fullName: "Atomic Experience CI",
      email: "atomic-exp@aventura.test",
      phone: null,
      language: "en",
      experienceKey: "historic-jeddah",
      requestedDate: null,
      partySize: 3
    });
    const experienceRow = await findRequestAndEvent(
      pool,
      "experience_requests",
      experience.referenceNumber,
      "experience_request.created"
    );
    assert.ok(experienceRow);
    assert.equal(experienceRow.event_status, "pending");
    assert.equal(experienceRow.payload.referenceNumber, experience.referenceNumber);
    assert.equal(experienceRow.payload.preferredLanguage, "en");
    created.push({ kind: "experience", ...experienceRow });

    const collaboration = await createPostgresCollaborationRequestRepository(pool).create({
      fullName: "Atomic Collaboration CI",
      email: "atomic-col@aventura.test",
      phone: null,
      language: "ar",
      organizationName: "Atomic CI Partner",
      collaborationType: "corporate-partnership",
      proposal: "Atomic outbox integration test"
    });
    const collaborationRow = await findRequestAndEvent(
      pool,
      "collaboration_requests",
      collaboration.referenceNumber,
      "collaboration_request.created"
    );
    assert.ok(collaborationRow);
    assert.equal(collaborationRow.event_status, "pending");
    assert.equal(collaborationRow.payload.referenceNumber, collaboration.referenceNumber);
    assert.equal(collaborationRow.payload.preferredLanguage, "ar");
    created.push({ kind: "collaboration", ...collaborationRow });
  } finally {
    for (const item of created) {
      await pool.query("DELETE FROM notification_outbox WHERE id = $1", [item.event_id]);
      const table = item.kind === "experience" ? "experience_requests" : "collaboration_requests";
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [item.request_id]);
      await pool.query("DELETE FROM customers WHERE id = $1", [item.customer_id]);
    }
    await pool.end();
  }
});

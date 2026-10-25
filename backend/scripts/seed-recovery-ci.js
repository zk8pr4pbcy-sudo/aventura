import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresExperienceRequestRepository } from "../src/experience-requests/postgres-repository.js";
import { createPostgresCollaborationRequestRepository } from "../src/collaboration-requests/postgres-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const pool = createDatabasePool(databaseUrl);
try {
  const experience = await createPostgresExperienceRequestRepository(pool).create({
    fullName: "Recovery Experience Guest",
    email: "recovery-experience@aventura.test",
    phone: null,
    language: "ar",
    experienceKey: "historic-jeddah",
    requestedDate: "2026-09-25",
    partySize: 2
  });

  const collaboration = await createPostgresCollaborationRequestRepository(pool).create({
    fullName: "Recovery Collaboration Partner",
    email: "recovery-collaboration@aventura.test",
    phone: null,
    language: "en",
    organizationName: "Recovery CI",
    collaborationType: "corporate-partnership",
    proposal: "Backup and restore verification record."
  });

  console.log(`Seeded ${experience.referenceNumber} and ${collaboration.referenceNumber}.`);
} finally {
  await pool.end();
}

import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePool } from "../src/database/pool.js";
import { createPostgresWebsiteContentRepository } from "../src/website-content/postgres-repository.js";
import { createWebsiteContentService } from "../src/website-content/service.js";

const databaseUrl = process.env.DATABASE_URL;

test("website content persists draft publish archive lifecycle with audit trail", { skip: !databaseUrl }, async () => {
  const pool = createDatabasePool(databaseUrl);
  let userId;
  let contentId;

  try {
    const user = await pool.query(
      `INSERT INTO users (email, display_name, role)
       VALUES ($1, 'Content CI', 'content')
       RETURNING id`,
      [`content-ci-${Date.now()}@aventura.test`]
    );
    userId = user.rows[0].id;

    const service = createWebsiteContentService(
      createPostgresWebsiteContentRepository(pool),
      { now: () => new Date("2026-09-19T02:00:00.000Z") }
    );

    const created = await service.create({
      contentType: "event",
      slug: `ci-event-${Date.now()}`,
      titleAr: "فعالية CI",
      titleEn: "CI Event",
      startsAt: "2026-09-19T01:00:00.000Z",
      endsAt: "2026-09-20T01:00:00.000Z",
      contentPayload: { venue: "Jeddah", audience: "corporate" },
      sortOrder: 25
    }, userId);
    contentId = created.id;
    assert.equal(created.status, "draft");
    assert.equal((await service.listPublic({ contentType: "event" })).length, 0);

    const published = await service.publish(contentId, userId);
    assert.equal(published.status, "published");

    const publicItems = await service.listPublic({ contentType: "event" });
    const visible = publicItems.find((item) => item.slug === created.slug);
    assert.ok(visible);
    assert.equal(visible.titleAr, "فعالية CI");
    assert.equal(visible.contentPayload.venue, "Jeddah");
    assert.equal(Object.hasOwn(visible, "id"), false);

    const archived = await service.archive(contentId, userId);
    assert.equal(archived.status, "archived");
    const afterArchive = await service.listPublic({ contentType: "event" });
    assert.equal(afterArchive.some((item) => item.slug === created.slug), false);

    const audit = await pool.query(
      `SELECT action FROM audit_log
       WHERE entity_type = 'website_content' AND entity_id = $1
       ORDER BY created_at ASC, id ASC`,
      [contentId]
    );
    assert.deepEqual(
      audit.rows.map((row) => row.action),
      [
        "website_content.created",
        "website_content.published",
        "website_content.archived"
      ]
    );
  } finally {
    if (contentId) {
      await pool.query("DELETE FROM audit_log WHERE entity_type = 'website_content' AND entity_id = $1", [contentId]);
      await pool.query("DELETE FROM website_content WHERE id = $1", [contentId]);
    }
    if (userId) await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    await pool.end();
  }
});

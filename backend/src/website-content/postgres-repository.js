const COLUMN_MAP = {
  contentType: "content_type",
  slug: "slug",
  titleAr: "title_ar",
  titleEn: "title_en",
  titleEs: "title_es",
  bodyAr: "body_ar",
  bodyEn: "body_en",
  bodyEs: "body_es",
  mediaUrl: "media_url",
  startsAt: "starts_at",
  endsAt: "ends_at",
  contentPayload: "content_payload",
  sortOrder: "sort_order"
};

function mapContent(row) {
  return {
    id: row.id,
    contentType: row.content_type,
    slug: row.slug,
    status: row.status,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    titleEs: row.title_es,
    bodyAr: row.body_ar,
    bodyEn: row.body_en,
    bodyEs: row.body_es,
    mediaUrl: row.media_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    publishedAt: row.published_at,
    contentPayload: row.content_payload,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by
  };
}

async function writeAudit(client, { actorUserId, action, entityId, metadata = {} }) {
  await client.query(
    `INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, 'website_content', $3, $4::jsonb)`,
    [actorUserId, action, entityId, JSON.stringify(metadata)]
  );
}

export function createPostgresWebsiteContentRepository(pool) {
  if (!pool || typeof pool.connect !== "function") {
    throw new Error("PostgreSQL pool is required");
  }

  return {
    async create(input, actorUserId) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `INSERT INTO website_content
             (content_type, slug, status,
              title_ar, title_en, title_es,
              body_ar, body_en, body_es,
              media_url, starts_at, ends_at,
              content_payload, sort_order,
              created_by, updated_by)
           VALUES ($1, $2, 'draft',
                   $3, $4, $5,
                   $6, $7, $8,
                   $9, $10, $11,
                   $12::jsonb, $13,
                   $14, $14)
           RETURNING *`,
          [
            input.contentType,
            input.slug,
            input.titleAr,
            input.titleEn,
            input.titleEs,
            input.bodyAr,
            input.bodyEn,
            input.bodyEs,
            input.mediaUrl,
            input.startsAt,
            input.endsAt,
            JSON.stringify(input.contentPayload),
            input.sortOrder,
            actorUserId
          ]
        );
        await writeAudit(client, {
          actorUserId,
          action: "website_content.created",
          entityId: result.rows[0].id,
          metadata: { contentType: input.contentType, slug: input.slug }
        });
        await client.query("COMMIT");
        return mapContent(result.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async update(id, patch, actorUserId) {
      const entries = Object.entries(patch).filter(([key]) => COLUMN_MAP[key]);
      if (!entries.length) return null;

      const values = entries.map(([, value]) => value);
      const assignments = entries.map(([key], index) => {
        const column = COLUMN_MAP[key];
        const cast = key === "contentPayload" ? "::jsonb" : "";
        if (key === "contentPayload") values[index] = JSON.stringify(values[index]);
        return `${column} = $${index + 1}${cast}`;
      });
      values.push(actorUserId, id);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `UPDATE website_content
           SET ${assignments.join(", ")},
               updated_by = $${values.length - 1},
               updated_at = now()
           WHERE id = $${values.length}
           RETURNING *`,
          values
        );
        if (!result.rowCount) {
          await client.query("ROLLBACK");
          return null;
        }
        await writeAudit(client, {
          actorUserId,
          action: "website_content.updated",
          entityId: id,
          metadata: { fields: entries.map(([key]) => key) }
        });
        await client.query("COMMIT");
        return mapContent(result.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async setStatus(id, status, actorUserId) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `UPDATE website_content
           SET status = $1,
               published_at = CASE WHEN $1 = 'published' THEN now() ELSE published_at END,
               updated_by = $2,
               updated_at = now()
           WHERE id = $3
           RETURNING *`,
          [status, actorUserId, id]
        );
        if (!result.rowCount) {
          await client.query("ROLLBACK");
          return null;
        }
        await writeAudit(client, {
          actorUserId,
          action: status === "published" ? "website_content.published" : "website_content.archived",
          entityId: id,
          metadata: { status }
        });
        await client.query("COMMIT");
        return mapContent(result.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async getById(id) {
      const result = await pool.query(
        "SELECT * FROM website_content WHERE id = $1 LIMIT 1",
        [id]
      );
      return result.rowCount ? mapContent(result.rows[0]) : null;
    },

    async listAdmin({ contentType, status, limit }) {
      const result = await pool.query(
        `SELECT * FROM website_content
         WHERE ($1::text IS NULL OR content_type = $1)
           AND ($2::content_status IS NULL OR status = $2::content_status)
         ORDER BY updated_at DESC, id DESC
         LIMIT $3`,
        [contentType, status, limit]
      );
      return result.rows.map(mapContent);
    },

    async listPublic({ contentType, limit, now }) {
      const result = await pool.query(
        `SELECT * FROM website_content
         WHERE content_type = $1
           AND status = 'published'
           AND (starts_at IS NULL OR starts_at <= $2)
           AND (ends_at IS NULL OR ends_at > $2)
         ORDER BY sort_order DESC,
                  COALESCE(starts_at, published_at, created_at) ASC,
                  id ASC
         LIMIT $3`,
        [contentType, now, limit]
      );
      return result.rows.map(mapContent);
    }
  };
}

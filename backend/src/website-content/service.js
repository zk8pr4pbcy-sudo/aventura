import { validateNewWebsiteContent, validateWebsiteContentPatch } from "./validation.js";

const CONTENT_TYPES = new Set(["event", "offer", "announcement", "experience"]);
const CONTENT_STATUSES = new Set(["draft", "published", "archived"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function serviceError(message, statusCode, fields) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (fields) error.fields = fields;
  return error;
}

function normalizeDatabaseError(error) {
  if (error?.code === "23505") return serviceError("content_slug_conflict", 409);
  if (error?.code === "23514") return serviceError("content_constraint_failed", 422);
  return error;
}

function requireId(id) {
  if (!UUID_PATTERN.test(id || "")) throw serviceError("invalid_content_id", 400);
}

function publicContent(item) {
  return {
    contentType: item.contentType,
    slug: item.slug,
    titleAr: item.titleAr,
    titleEn: item.titleEn,
    titleEs: item.titleEs,
    bodyAr: item.bodyAr,
    bodyEn: item.bodyEn,
    bodyEs: item.bodyEs,
    mediaUrl: item.mediaUrl,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    contentPayload: item.contentPayload,
    sortOrder: item.sortOrder,
    publishedAt: item.publishedAt
  };
}

export function createWebsiteContentService(repository, options = {}) {
  if (!repository || typeof repository.create !== "function" || typeof repository.update !== "function" || typeof repository.getById !== "function" || typeof repository.setStatus !== "function" || typeof repository.listAdmin !== "function" || typeof repository.listPublic !== "function") {
    throw new Error("website content repository is required");
  }

  const now = options.now || (() => new Date());

  return {
    async create(input, actorUserId) {
      const validated = validateNewWebsiteContent(input);
      if (!validated.ok) throw serviceError("validation_failed", 422, validated.errors);
      try {
        return await repository.create(validated.value, actorUserId);
      } catch (error) {
        throw normalizeDatabaseError(error);
      }
    },

    async update(id, input, actorUserId) {
      requireId(id);
      const validated = validateWebsiteContentPatch(input);
      if (!validated.ok) throw serviceError("validation_failed", 422, validated.errors);

      const current = await repository.getById(id);
      if (!current) throw serviceError("content_not_found", 404);

      const startsAt = Object.hasOwn(validated.value, "startsAt") ? validated.value.startsAt : current.startsAt;
      const endsAt = Object.hasOwn(validated.value, "endsAt") ? validated.value.endsAt : current.endsAt;
      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
        throw serviceError("validation_failed", 422, { endsAt: "must_be_after_start" });
      }

      try {
        const updated = await repository.update(id, validated.value, actorUserId);
        if (!updated) throw serviceError("content_not_found", 404);
        return updated;
      } catch (error) {
        throw normalizeDatabaseError(error);
      }
    },

    async publish(id, actorUserId) {
      requireId(id);
      const current = await repository.getById(id);
      if (!current) throw serviceError("content_not_found", 404);
      if (current.endsAt && new Date(current.endsAt) <= now()) {
        throw serviceError("content_window_expired", 409);
      }
      return repository.setStatus(id, "published", actorUserId);
    },

    async archive(id, actorUserId) {
      requireId(id);
      const current = await repository.getById(id);
      if (!current) throw serviceError("content_not_found", 404);
      return repository.setStatus(id, "archived", actorUserId);
    },

    async getAdmin(id) {
      requireId(id);
      const item = await repository.getById(id);
      if (!item) throw serviceError("content_not_found", 404);
      return item;
    },

    async listAdmin(input = {}) {
      const contentType = input.contentType || null;
      const status = input.status || null;
      const limit = input.limit == null ? 50 : Number(input.limit);
      if (contentType && !CONTENT_TYPES.has(contentType)) throw serviceError("invalid_content_type", 400);
      if (status && !CONTENT_STATUSES.has(status)) throw serviceError("invalid_content_status", 400);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw serviceError("invalid_limit", 400);
      return repository.listAdmin({ contentType, status, limit });
    },

    async listPublic({ contentType, limit = 50 }) {
      if (!CONTENT_TYPES.has(contentType)) throw serviceError("invalid_content_type", 400);
      const normalizedLimit = Number(limit);
      if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 100) {
        throw serviceError("invalid_limit", 400);
      }
      const items = await repository.listPublic({
        contentType,
        limit: normalizedLimit,
        now: now()
      });
      return items.map(publicContent);
    }
  };
}

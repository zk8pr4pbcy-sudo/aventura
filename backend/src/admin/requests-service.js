const REQUEST_KINDS = new Set(["experience", "collaboration"]);
const REQUEST_STATUSES = new Set([
  "new",
  "under_review",
  "contacted",
  "quoted",
  "confirmed",
  "not_suitable",
  "closed",
  "cancelled"
]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function createAdminRequestsService(repository) {
  if (!repository || typeof repository.list !== "function" || typeof repository.getById !== "function") {
    throw new Error("admin requests repository is required");
  }

  return {
    async list(input = {}) {
      const kind = input.kind || null;
      const status = input.status || null;
      const rawLimit = input.limit == null ? 50 : Number(input.limit);
      const before = input.before || null;

      if (kind && !REQUEST_KINDS.has(kind)) throw badRequest("invalid_request_kind");
      if (status && !REQUEST_STATUSES.has(status)) throw badRequest("invalid_request_status");
      if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) throw badRequest("invalid_limit");
      if (before && Number.isNaN(Date.parse(before))) throw badRequest("invalid_before_cursor");

      return repository.list({ kind, status, limit: rawLimit, before });
    },

    async get({ kind, requestId }) {
      if (!REQUEST_KINDS.has(kind)) throw badRequest("invalid_request_kind");
      if (!UUID_PATTERN.test(requestId || "")) throw badRequest("invalid_request_id");
      const request = await repository.getById({ kind, requestId });
      if (!request) {
        const error = new Error("request_not_found");
        error.statusCode = 404;
        throw error;
      }
      return request;
    }
  };
}

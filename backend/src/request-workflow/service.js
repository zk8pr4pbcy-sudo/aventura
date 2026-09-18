import { canTransition, isRequestKind } from "./transitions.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validateRequestIdentity(kind, requestId) {
  if (!isRequestKind(kind)) {
    const error = new Error("invalid_request_kind");
    error.statusCode = 400;
    throw error;
  }
  if (!UUID_PATTERN.test(requestId || "")) {
    const error = new Error("invalid_request_id");
    error.statusCode = 400;
    throw error;
  }
}

export function createRequestWorkflowService(repository) {
  if (!repository || typeof repository.getStatus !== "function" || typeof repository.changeStatus !== "function" || typeof repository.addNote !== "function") {
    throw new Error("request workflow repository is required");
  }

  return {
    async changeStatus({ kind, requestId, toStatus, actorUserId, note }) {
      validateRequestIdentity(kind, requestId);
      if (!actorUserId || !toStatus) {
        const error = new Error("missing_required_fields");
        error.statusCode = 400;
        throw error;
      }

      const currentStatus = await repository.getStatus({ kind, requestId });
      if (!currentStatus) {
        const error = new Error("request_not_found");
        error.statusCode = 404;
        throw error;
      }
      if (!canTransition(kind, currentStatus, toStatus)) {
        const error = new Error("invalid_status_transition");
        error.statusCode = 409;
        throw error;
      }

      return repository.changeStatus({
        kind,
        requestId,
        fromStatus: currentStatus,
        toStatus,
        actorUserId,
        note: cleanText(note, 2000) || null
      });
    },

    async addNote({ kind, requestId, authorUserId, body }) {
      validateRequestIdentity(kind, requestId);
      const cleanBody = cleanText(body, 4000);
      if (!authorUserId || !cleanBody) {
        const error = new Error("missing_required_fields");
        error.statusCode = 400;
        throw error;
      }

      return repository.addNote({ kind, requestId, authorUserId, body: cleanBody });
    }
  };
}

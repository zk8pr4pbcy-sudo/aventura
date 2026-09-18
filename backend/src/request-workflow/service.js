import { canTransition, isRequestKind } from "./transitions.js";

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function createRequestWorkflowService(repository) {
  if (!repository || typeof repository.getStatus !== "function" || typeof repository.changeStatus !== "function" || typeof repository.addNote !== "function") {
    throw new Error("request workflow repository is required");
  }

  return {
    async changeStatus({ kind, requestId, toStatus, actorUserId, note }) {
      if (!isRequestKind(kind)) {
        const error = new Error("invalid_request_kind");
        error.statusCode = 400;
        throw error;
      }
      if (!requestId || !actorUserId || !toStatus) {
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
      if (!isRequestKind(kind)) {
        const error = new Error("invalid_request_kind");
        error.statusCode = 400;
        throw error;
      }
      const cleanBody = cleanText(body, 4000);
      if (!requestId || !authorUserId || !cleanBody) {
        const error = new Error("missing_required_fields");
        error.statusCode = 400;
        throw error;
      }

      return repository.addNote({ kind, requestId, authorUserId, body: cleanBody });
    }
  };
}

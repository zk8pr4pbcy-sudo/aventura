import assert from "node:assert/strict";
import test from "node:test";
import { createRequestWorkflowService } from "../src/request-workflow/service.js";

function fakeRepository(initialStatus = "new") {
  let status = initialStatus;
  const changes = [];
  const notes = [];
  return {
    repository: {
      async getStatus() { return status; },
      async changeStatus(change) {
        changes.push(change);
        status = change.toStatus;
        return { status, previousStatus: change.fromStatus };
      },
      async addNote(note) {
        notes.push(note);
        return { id: "note-1", createdAt: new Date("2026-09-19T00:00:00Z") };
      }
    },
    changes,
    notes
  };
}

test("experience workflow accepts a valid status transition", async () => {
  const fake = fakeRepository("new");
  const service = createRequestWorkflowService(fake.repository);
  const result = await service.changeStatus({
    kind: "experience",
    requestId: "request-1",
    toStatus: "under_review",
    actorUserId: "user-1",
    note: "Initial review"
  });
  assert.equal(result.status, "under_review");
  assert.equal(fake.changes.length, 1);
  assert.equal(fake.changes[0].fromStatus, "new");
});

test("workflow rejects skipping directly from new to confirmed", async () => {
  const fake = fakeRepository("new");
  const service = createRequestWorkflowService(fake.repository);
  await assert.rejects(
    service.changeStatus({
      kind: "experience",
      requestId: "request-1",
      toStatus: "confirmed",
      actorUserId: "user-1"
    }),
    (error) => error.message === "invalid_status_transition" && error.statusCode === 409
  );
  assert.equal(fake.changes.length, 0);
});

test("collaboration workflow does not use quoted status", async () => {
  const fake = fakeRepository("under_review");
  const service = createRequestWorkflowService(fake.repository);
  await assert.rejects(
    service.changeStatus({
      kind: "collaboration",
      requestId: "request-2",
      toStatus: "quoted",
      actorUserId: "user-1"
    }),
    /invalid_status_transition/
  );
});

test("internal note requires non-empty body", async () => {
  const fake = fakeRepository();
  const service = createRequestWorkflowService(fake.repository);
  await assert.rejects(
    service.addNote({
      kind: "experience",
      requestId: "request-1",
      authorUserId: "user-1",
      body: "   "
    }),
    /missing_required_fields/
  );
  assert.equal(fake.notes.length, 0);
});

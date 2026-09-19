import assert from "node:assert/strict";
import test from "node:test";
import { createRequestWorkflowService } from "../src/request-workflow/service.js";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

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
    requestId: REQUEST_ID,
    toStatus: "under_review",
    actorUserId: USER_ID,
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
      requestId: REQUEST_ID,
      toStatus: "confirmed",
      actorUserId: USER_ID
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
      requestId: REQUEST_ID,
      toStatus: "quoted",
      actorUserId: USER_ID
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
      requestId: REQUEST_ID,
      authorUserId: USER_ID,
      body: "   "
    }),
    /missing_required_fields/
  );
  assert.equal(fake.notes.length, 0);
});

test("workflow rejects malformed request identifiers before repository access", async () => {
  const fake = fakeRepository();
  const service = createRequestWorkflowService(fake.repository);
  await assert.rejects(
    service.changeStatus({
      kind: "experience",
      requestId: "not-a-uuid",
      toStatus: "under_review",
      actorUserId: USER_ID
    }),
    (error) => error.message === "invalid_request_id" && error.statusCode === 400
  );
  assert.equal(fake.changes.length, 0);
});

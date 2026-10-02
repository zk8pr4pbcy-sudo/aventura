import assert from "node:assert/strict";
import test from "node:test";
import { createAdminRequestsService } from "../src/admin/requests-service.js";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

function serviceWith(repositoryOverrides = {}) {
  return createAdminRequestsService({
    async list(input) { return [input]; },
    async getById() { return { id: REQUEST_ID, kind: "experience" }; },
    ...repositoryOverrides
  });
}

test("admin request list normalizes filters and defaults", async () => {
  const service = serviceWith();
  const result = await service.list({ kind: "experience", status: "new" });
  assert.equal(result[0].kind, "experience");
  assert.equal(result[0].status, "new");
  assert.equal(result[0].limit, 50);
});

test("admin request list rejects invalid filters", async () => {
  const service = serviceWith();
  await assert.rejects(service.list({ kind: "unknown" }), /invalid_request_kind/);
  await assert.rejects(service.list({ status: "unknown" }), /invalid_request_status/);
  await assert.rejects(service.list({ limit: 101 }), /invalid_limit/);
  await assert.rejects(service.list({ before: "not-a-date" }), /invalid_before_cursor/);
});

test("admin request get rejects malformed ids and reports missing records", async () => {
  const service = serviceWith({ async getById() { return null; } });
  await assert.rejects(service.get({ kind: "experience", requestId: "bad" }), /invalid_request_id/);
  await assert.rejects(
    service.get({ kind: "experience", requestId: REQUEST_ID }),
    (error) => error.message === "request_not_found" && error.statusCode === 404
  );
});

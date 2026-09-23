import assert from "node:assert/strict";
import test from "node:test";
import { createAdminDashboardService } from "../src/admin/dashboard-service.js";


test("dashboard summary aggregates request counts and recent queue", async () => {
  const service = createAdminDashboardService(
    {
      async getCounts() {
        return [
          { kind: "experience", status: "new", count: 2 },
          { kind: "experience", status: "confirmed", count: 1 },
          { kind: "collaboration", status: "new", count: 1 },
          { kind: "collaboration", status: "closed", count: 3 }
        ];
      }
    },
    {
      async list(input) {
        assert.equal(input.limit, 10);
        return [{ referenceNumber: "AV-EXP-2026-000001" }];
      }
    }
  );

  const summary = await service.getSummary();
  assert.deepEqual(summary.totals, {
    all: 7,
    active: 4,
    new: 3,
    experience: 3,
    collaboration: 4
  });
  assert.equal(summary.byStatus.new, 3);
  assert.equal(summary.byStatus.closed, 3);
  assert.equal(summary.recentRequests.length, 1);
});

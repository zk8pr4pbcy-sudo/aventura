const ACTIVE_STATUSES = new Set(["new", "under_review", "contacted", "quoted", "confirmed"]);

export function createAdminDashboardService(repository, adminRequests) {
  if (!repository || typeof repository.getCounts !== "function") {
    throw new Error("admin dashboard repository is required");
  }
  if (!adminRequests || typeof adminRequests.list !== "function") {
    throw new Error("admin requests service is required");
  }

  return {
    async getSummary() {
      const [rows, recentRequests] = await Promise.all([
        repository.getCounts(),
        adminRequests.list({ limit: 10 })
      ]);

      const byKind = { experience: 0, collaboration: 0 };
      const byStatus = {};
      let total = 0;
      let active = 0;
      let newRequests = 0;

      for (const row of rows) {
        const count = Number(row.count) || 0;
        total += count;
        byKind[row.kind] = (byKind[row.kind] || 0) + count;
        byStatus[row.status] = (byStatus[row.status] || 0) + count;
        if (ACTIVE_STATUSES.has(row.status)) active += count;
        if (row.status === "new") newRequests += count;
      }

      return {
        totals: {
          all: total,
          active,
          new: newRequests,
          experience: byKind.experience,
          collaboration: byKind.collaboration
        },
        byStatus,
        recentRequests
      };
    }
  };
}

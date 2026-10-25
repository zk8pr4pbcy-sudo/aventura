export function createUnconfiguredExperienceRequestRepository() {
  return {
    async create() {
      const error = new Error("database_not_configured");
      error.statusCode = 503;
      throw error;
    }
  };
}

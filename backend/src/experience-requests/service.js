export function createExperienceRequestService(repository) {
  if (!repository || typeof repository.create !== "function") {
    throw new Error("experience request repository is required");
  }

  return {
    async create(input) {
      return repository.create(input);
    }
  };
}

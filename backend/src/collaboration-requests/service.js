export function createCollaborationRequestService(repository) {
  if (!repository || typeof repository.create !== "function") {
    throw new Error("collaboration request repository is required");
  }

  return {
    async create(input) {
      return repository.create(input);
    }
  };
}

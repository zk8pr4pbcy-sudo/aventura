import { createDatabasePool } from "./pool.js";
import { createExperienceRequestService } from "../experience-requests/service.js";
import { createPostgresExperienceRequestRepository } from "../experience-requests/postgres-repository.js";
import { createCollaborationRequestService } from "../collaboration-requests/service.js";
import { createPostgresCollaborationRequestRepository } from "../collaboration-requests/postgres-repository.js";
import { createRequestWorkflowService } from "../request-workflow/service.js";
import { createPostgresRequestWorkflowRepository } from "../request-workflow/postgres-repository.js";
import { createAuthService } from "../auth/service.js";
import { createPostgresAuthRepository } from "../auth/postgres-repository.js";

export function createDatabaseDependencies(config) {
  if (!config.databaseUrl) return { dependencies: {}, close: async () => {} };

  const pool = createDatabasePool(config.databaseUrl);
  return {
    dependencies: {
      experienceRequests: createExperienceRequestService(
        createPostgresExperienceRequestRepository(pool)
      ),
      collaborationRequests: createCollaborationRequestService(
        createPostgresCollaborationRequestRepository(pool)
      ),
      requestWorkflow: createRequestWorkflowService(
        createPostgresRequestWorkflowRepository(pool)
      ),
      auth: createAuthService(createPostgresAuthRepository(pool))
    },
    close: () => pool.end()
  };
}

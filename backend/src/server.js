import http from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { readJson, sendJson } from "./http/json.js";
import { validateExperienceRequest } from "./experience-requests/validation.js";
import { createExperienceRequestService } from "./experience-requests/service.js";
import { createUnconfiguredExperienceRequestRepository } from "./experience-requests/repository.js";
import { createDatabaseDependencies } from "./database/dependencies.js";

export function createServer(config = loadConfig(), dependencies = {}) {
  const experienceRequests = dependencies.experienceRequests ||
    createExperienceRequestService(createUnconfiguredExperienceRequestRepository());

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, service: config.serviceName, environment: config.env });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/experience-requests") {
      try {
        const payload = await readJson(req);
        const validated = validateExperienceRequest(payload);
        if (!validated.ok) {
          sendJson(res, 422, { error: "validation_failed", fields: validated.errors });
          return;
        }

        const request = await experienceRequests.create(validated.value);
        sendJson(res, 201, {
          referenceNumber: request.referenceNumber,
          status: request.status
        });
      } catch (error) {
        const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
        sendJson(res, statusCode, {
          error: statusCode >= 500 ? "service_unavailable" : error.message
        });
      }
      return;
    }

    sendJson(res, 404, { error: "not_found" });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = loadConfig();
  const database = createDatabaseDependencies(config);
  const server = createServer(config, database.dependencies);

  server.listen(config.port, () => {
    console.log(`${config.serviceName} listening on port ${config.port}`);
  });

  const shutdown = () => server.close(async () => {
    await database.close();
    process.exit(0);
  });
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

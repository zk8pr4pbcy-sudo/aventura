import http from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { readJson, sendJson } from "./http/json.js";
import { validateExperienceRequest } from "./experience-requests/validation.js";
import { createExperienceRequestService } from "./experience-requests/service.js";
import { createUnconfiguredExperienceRequestRepository } from "./experience-requests/repository.js";
import { validateCollaborationRequest } from "./collaboration-requests/validation.js";
import { createCollaborationRequestService } from "./collaboration-requests/service.js";
import { createUnconfiguredCollaborationRequestRepository } from "./collaboration-requests/repository.js";
import { readAdminSessionCookie, createAdminSessionCookie, clearAdminSessionCookie } from "./auth/cookies.js";
import { createDatabaseDependencies } from "./database/dependencies.js";

function sendError(res, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  sendJson(res, statusCode, {
    error: statusCode >= 500 ? "service_unavailable" : error.message
  });
}

export function createServer(config = loadConfig(), dependencies = {}) {
  const experienceRequests = dependencies.experienceRequests ||
    createExperienceRequestService(createUnconfiguredExperienceRequestRepository());
  const collaborationRequests = dependencies.collaborationRequests ||
    createCollaborationRequestService(createUnconfiguredCollaborationRequestRepository());
  const auth = dependencies.auth || null;
  const secureAdminCookie = config.env === "production";

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
        sendError(res, error);
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/collaboration-requests") {
      try {
        const payload = await readJson(req);
        const validated = validateCollaborationRequest(payload);
        if (!validated.ok) {
          sendJson(res, 422, { error: "validation_failed", fields: validated.errors });
          return;
        }

        const request = await collaborationRequests.create(validated.value);
        sendJson(res, 201, {
          referenceNumber: request.referenceNumber,
          status: request.status
        });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/admin/auth/login") {
      if (!auth) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        const payload = await readJson(req, 8 * 1024);
        const session = await auth.login({ email: payload.email, password: payload.password });
        res.setHeader("set-cookie", createAdminSessionCookie(session.token, {
          secure: secureAdminCookie,
          maxAgeSeconds: 8 * 60 * 60
        }));
        sendJson(res, 200, { user: session.user, expiresAt: session.expiresAt });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/v1/admin/auth/session") {
      if (!auth) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        const user = await auth.authenticate(readAdminSessionCookie(req) || "");
        sendJson(res, 200, { user });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/admin/auth/logout") {
      if (!auth) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        const token = readAdminSessionCookie(req);
        if (token) await auth.logout(token);
        res.setHeader("set-cookie", clearAdminSessionCookie({ secure: secureAdminCookie }));
        sendJson(res, 200, { ok: true });
      } catch (error) {
        sendError(res, error);
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

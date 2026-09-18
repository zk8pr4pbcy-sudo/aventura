import http from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { readJson, sendJson } from "./http/json.js";
import { trySendAdminAsset } from "./http/static.js";
import { validateExperienceRequest } from "./experience-requests/validation.js";
import { createExperienceRequestService } from "./experience-requests/service.js";
import { createUnconfiguredExperienceRequestRepository } from "./experience-requests/repository.js";
import { validateCollaborationRequest } from "./collaboration-requests/validation.js";
import { createCollaborationRequestService } from "./collaboration-requests/service.js";
import { createUnconfiguredCollaborationRequestRepository } from "./collaboration-requests/repository.js";
import { readAdminSessionCookie, createAdminSessionCookie, clearAdminSessionCookie } from "./auth/cookies.js";
import { requirePermission } from "./auth/permissions.js";
import { createLoginFailureLimiter } from "./security/login-rate-limit.js";
import { enforceTurnstile, verifyTurnstileToken } from "./security/turnstile.js";
import { handleWebsiteContentRequest } from "./website-content/http.js";
import { createDatabaseDependencies } from "./database/dependencies.js";

function sendError(res, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (statusCode === 429 && Number.isFinite(error.retryAfterSeconds)) {
    res.setHeader("retry-after", String(Math.max(1, Math.ceil(error.retryAfterSeconds))));
  }
  sendJson(res, statusCode, {
    error: statusCode >= 500 ? "service_unavailable" : error.message
  });
}

async function authenticateAdmin(req, auth, permission) {
  if (!auth) {
    const error = new Error("service_unavailable");
    error.statusCode = 503;
    throw error;
  }
  const user = await auth.authenticate(readAdminSessionCookie(req) || "");
  return requirePermission(user, permission);
}

export function createServer(config = loadConfig(), dependencies = {}) {
  const experienceRequests = dependencies.experienceRequests ||
    createExperienceRequestService(createUnconfiguredExperienceRequestRepository());
  const collaborationRequests = dependencies.collaborationRequests ||
    createCollaborationRequestService(createUnconfiguredCollaborationRequestRepository());
  const auth = dependencies.auth || null;
  const adminRequests = dependencies.adminRequests || null;
  const adminDashboard = dependencies.adminDashboard || null;
  const requestWorkflow = dependencies.requestWorkflow || null;
  const websiteContent = dependencies.websiteContent || null;
  const turnstileVerifier = dependencies.turnstileVerifier || verifyTurnstileToken;
  const loginLimiter = dependencies.loginLimiter || createLoginFailureLimiter();
  const publicRequestsEnabled = config.publicRequestsEnabled !== false;
  const turnstileConfig = config.turnstile || { required: false, secretKey: null, hostnames: [] };
  const secureAdminCookie = config.env === "production";

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (req.method === "GET" && url.pathname.startsWith("/admin")) {
      try {
        if (await trySendAdminAsset(url.pathname, res)) return;
      } catch (error) {
        sendError(res, error);
        return;
      }
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, service: config.serviceName, environment: config.env });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/experience-requests") {
      if (!publicRequestsEnabled) {
        sendJson(res, 404, { error: "not_found" });
        return;
      }
      try {
        const payload = await readJson(req);
        await enforceTurnstile({
          payload,
          config: turnstileConfig,
          expectedAction: "experience_request",
          verifier: turnstileVerifier
        });
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
      if (!publicRequestsEnabled) {
        sendJson(res, 404, { error: "not_found" });
        return;
      }
      try {
        const payload = await readJson(req);
        await enforceTurnstile({
          payload,
          config: turnstileConfig,
          expectedAction: "collaboration_request",
          verifier: turnstileVerifier
        });
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

    if (await handleWebsiteContentRequest({
      req,
      res,
      url,
      service: websiteContent,
      auth
    })) return;

    if (req.method === "POST" && url.pathname === "/api/v1/admin/auth/login") {
      if (!auth) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      let attempt = null;
      try {
        const payload = await readJson(req, 8 * 1024);
        attempt = {
          email: payload.email,
          ip: req.socket?.remoteAddress || "unknown"
        };
        loginLimiter.assertAllowed(attempt);
        const session = await auth.login({ email: payload.email, password: payload.password });
        loginLimiter.recordSuccess(attempt);
        res.setHeader("set-cookie", createAdminSessionCookie(session.token, {
          secure: secureAdminCookie,
          maxAgeSeconds: 8 * 60 * 60
        }));
        sendJson(res, 200, { user: session.user, expiresAt: session.expiresAt });
      } catch (error) {
        if (attempt && error?.statusCode === 401 && error?.message === "invalid_credentials") {
          loginLimiter.recordFailure(attempt);
        }
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

    if (req.method === "GET" && url.pathname === "/api/v1/admin/dashboard/summary") {
      if (!adminDashboard) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        await authenticateAdmin(req, auth, "requests:read");
        sendJson(res, 200, { summary: await adminDashboard.getSummary() });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/v1/admin/requests") {
      if (!adminRequests) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        await authenticateAdmin(req, auth, "requests:read");
        const requests = await adminRequests.list({
          kind: url.searchParams.get("kind") || null,
          status: url.searchParams.get("status") || null,
          limit: url.searchParams.get("limit") || undefined,
          before: url.searchParams.get("before") || null
        });
        sendJson(res, 200, { requests });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    const requestMatch = url.pathname.match(/^\/api\/v1\/admin\/requests\/(experience|collaboration)\/([0-9a-f-]+)$/i);
    if (req.method === "GET" && requestMatch) {
      if (!adminRequests) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        await authenticateAdmin(req, auth, "requests:read");
        const request = await adminRequests.get({ kind: requestMatch[1].toLowerCase(), requestId: requestMatch[2] });
        sendJson(res, 200, { request });
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/v1\/admin\/requests\/(experience|collaboration)\/([0-9a-f-]+)\/status$/i);
    if (req.method === "PATCH" && statusMatch) {
      if (!requestWorkflow) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        const user = await authenticateAdmin(req, auth, "requests:update");
        const payload = await readJson(req, 8 * 1024);
        const result = await requestWorkflow.changeStatus({
          kind: statusMatch[1].toLowerCase(),
          requestId: statusMatch[2],
          toStatus: payload.status,
          actorUserId: user.id,
          note: payload.note
        });
        sendJson(res, 200, result);
      } catch (error) {
        sendError(res, error);
      }
      return;
    }

    const noteMatch = url.pathname.match(/^\/api\/v1\/admin\/requests\/(experience|collaboration)\/([0-9a-f-]+)\/notes$/i);
    if (req.method === "POST" && noteMatch) {
      if (!requestWorkflow) {
        sendJson(res, 503, { error: "service_unavailable" });
        return;
      }
      try {
        const user = await authenticateAdmin(req, auth, "notes:write");
        const payload = await readJson(req, 8 * 1024);
        const note = await requestWorkflow.addNote({
          kind: noteMatch[1].toLowerCase(),
          requestId: noteMatch[2],
          authorUserId: user.id,
          body: payload.body
        });
        sendJson(res, 201, { note });
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

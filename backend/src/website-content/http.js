import { readJson, sendJson } from "../http/json.js";
import { readAdminSessionCookie } from "../auth/cookies.js";
import { requirePermission } from "../auth/permissions.js";

function sendError(res, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const body = {
    error: statusCode >= 500 ? "service_unavailable" : error.message
  };
  if (statusCode === 422 && error.fields) body.fields = error.fields;
  sendJson(res, statusCode, body);
}

async function requireContentManager(req, auth) {
  if (!auth) {
    const error = new Error("service_unavailable");
    error.statusCode = 503;
    throw error;
  }
  const user = await auth.authenticate(readAdminSessionCookie(req) || "");
  return requirePermission(user, "content:manage");
}

export async function handleWebsiteContentRequest({ req, res, url, service, auth }) {
  const publicMatch = url.pathname.match(/^\/api\/v1\/content\/(event|offer|announcement|experience)$/);
  if (req.method === "GET" && publicMatch) {
    if (!service) {
      sendJson(res, 503, { error: "service_unavailable" });
      return true;
    }
    try {
      const items = await service.listPublic({
        contentType: publicMatch[1],
        limit: url.searchParams.get("limit") || 50
      });
      sendJson(res, 200, { items });
    } catch (error) {
      sendError(res, error);
    }
    return true;
  }

  if (url.pathname === "/api/v1/admin/content") {
    if (!service) {
      sendJson(res, 503, { error: "service_unavailable" });
      return true;
    }

    if (req.method === "GET") {
      try {
        await requireContentManager(req, auth);
        const items = await service.listAdmin({
          contentType: url.searchParams.get("type") || null,
          status: url.searchParams.get("status") || null,
          limit: url.searchParams.get("limit") || 50
        });
        sendJson(res, 200, { items });
      } catch (error) {
        sendError(res, error);
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const user = await requireContentManager(req, auth);
        const item = await service.create(await readJson(req, 64 * 1024), user.id);
        sendJson(res, 201, { item });
      } catch (error) {
        sendError(res, error);
      }
      return true;
    }
  }

  const itemMatch = url.pathname.match(/^\/api\/v1\/admin\/content\/([0-9a-f-]+)$/i);
  if (itemMatch && (req.method === "GET" || req.method === "PATCH")) {
    if (!service) {
      sendJson(res, 503, { error: "service_unavailable" });
      return true;
    }
    try {
      const user = await requireContentManager(req, auth);
      if (req.method === "GET") {
        sendJson(res, 200, { item: await service.getAdmin(itemMatch[1]) });
      } else {
        const item = await service.update(itemMatch[1], await readJson(req, 64 * 1024), user.id);
        sendJson(res, 200, { item });
      }
    } catch (error) {
      sendError(res, error);
    }
    return true;
  }

  const actionMatch = url.pathname.match(/^\/api\/v1\/admin\/content\/([0-9a-f-]+)\/(publish|archive)$/i);
  if (req.method === "POST" && actionMatch) {
    if (!service) {
      sendJson(res, 503, { error: "service_unavailable" });
      return true;
    }
    try {
      const user = await requireContentManager(req, auth);
      const item = actionMatch[2].toLowerCase() === "publish"
        ? await service.publish(actionMatch[1], user.id)
        : await service.archive(actionMatch[1], user.id);
      sendJson(res, 200, { item });
    } catch (error) {
      sendError(res, error);
    }
    return true;
  }

  return false;
}

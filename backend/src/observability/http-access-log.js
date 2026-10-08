import { randomUUID } from "node:crypto";

function elapsedMilliseconds(startedAt) {
  return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
}

export function attachHttpAccessLog(req, res, url, options = {}) {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  const write = options.write || console.log;

  res.setHeader("x-request-id", requestId);
  res.once("finish", () => {
    write(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? "error" : "info",
      event: "http_request",
      requestId,
      method: req.method || "UNKNOWN",
      path: url.pathname,
      statusCode: res.statusCode,
      durationMs: Number(elapsedMilliseconds(startedAt).toFixed(2))
    }));
  });

  return requestId;
}

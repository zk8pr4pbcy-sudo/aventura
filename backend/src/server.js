import http from "node:http";
import { loadConfig } from "./config.js";

export function createServer(config = loadConfig()) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        ok: true,
        service: config.serviceName,
        environment: config.env
      }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const config = loadConfig();
  createServer(config).listen(config.port, () => {
    console.log(`${config.serviceName} listening on port ${config.port}`);
  });
}

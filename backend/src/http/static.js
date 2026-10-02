import { readFile } from "node:fs/promises";

const ADMIN_ASSETS = new Map([
  ["/admin", ["index.html", "text/html; charset=utf-8"]],
  ["/admin/", ["index.html", "text/html; charset=utf-8"]],
  ["/admin/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/admin/content.js", ["content.js", "text/javascript; charset=utf-8"]],
  ["/admin/styles.css", ["styles.css", "text/css; charset=utf-8"]]
]);

const adminRoot = new URL("../../admin-ui/", import.meta.url);

export async function trySendAdminAsset(pathname, res) {
  const asset = ADMIN_ASSETS.get(pathname);
  if (!asset) return false;

  const [filename, contentType] = asset;
  const body = await readFile(new URL(filename, adminRoot));
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-frame-options": "DENY"
  });
  res.end(body);
  return true;
}

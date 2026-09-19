import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(fn) {
  const server = createServer({
    env: "test",
    port: 0,
    serviceName: "aventura-backend",
    databaseUrl: null
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("admin UI is served only from explicit backend admin routes with security headers", async () => {
  await withServer(async (base) => {
    const page = await fetch(`${base}/admin`);
    const html = await page.text();
    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-type"), /text\/html/);
    assert.match(page.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    assert.equal(page.headers.get("x-frame-options"), "DENY");
    assert.match(html, /Aventura Management System/);
    assert.match(html, /noindex,nofollow,noarchive/);
    assert.match(html, /id="contentPanel"/);
    assert.match(html, /\/admin\/content\.js/);

    const script = await fetch(`${base}/admin/app.js`);
    assert.equal(script.status, 200);
    assert.match(script.headers.get("content-type"), /javascript/);

    const contentScript = await fetch(`${base}/admin/content.js`);
    assert.equal(contentScript.status, 200);
    assert.match(contentScript.headers.get("content-type"), /javascript/);
    assert.match(await contentScript.text(), /content:manage|admin\/content/);

    const style = await fetch(`${base}/admin/styles.css`);
    assert.equal(style.status, 200);
    assert.match(style.headers.get("content-type"), /text\/css/);

    const unknown = await fetch(`${base}/admin/unknown`);
    assert.equal(unknown.status, 404);
  });
});

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const context = { window: {} };

[
  "assets/js/translations.js",
  "assets/js/home-phase1-i18n.js",
  "assets/js/home-brand-reset.js"
].forEach((file) => {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context);
});

const arabic = context.window.AVENTURA_I18N?.ar || {};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function bodyDataKey(html, attribute) {
  const body = html.match(/<body\b[^>]*>/i)?.[0] || "";
  return body.match(new RegExp(`\\b${attribute}="([^"]+)"`, "i"))?.[1] || "";
}

function replaceTitle(html, value) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(value)}</title>`);
}

function replaceMeta(html, attribute, name, value) {
  const expression = new RegExp(`(<meta\\s+${attribute}="${name}"\\s+content=")[^"]*(")`, "i");
  return html.replace(expression, `$1${escapeHtml(value)}$2`);
}

for (const file of fs.readdirSync(root).filter((entry) => entry.endsWith(".html"))) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");
  const titleKey = bodyDataKey(html, "data-title-key");
  const descriptionKey = bodyDataKey(html, "data-description-key");
  const title = arabic[titleKey];
  const description = arabic[descriptionKey];

  if (!title || !description) {
    throw new Error(`${file}: missing Arabic metadata key`);
  }

  html = replaceTitle(html, title);
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "property", "og:locale", "ar_SA");

  fs.writeFileSync(filePath, html, "utf8");
}

console.log("Updated Arabic default metadata for all HTML pages.");

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const publicFiles = htmlFiles.filter((file) => file !== "404.html");
const errors = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function count(source, expression) {
  return [...source.matchAll(expression)].length;
}

function localTarget(file, target) {
  const clean = target.split("#")[0].split("?")[0];
  if (!clean || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return null;
  return path.resolve(root, path.dirname(file), clean);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (count(source, /<h1\b/gi) !== 1) fail(file, "must contain exactly one h1");
  if (!/<title>[^<]+<\/title>/i.test(source)) fail(file, "missing title");
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(source)) fail(file, "missing description");
  if (!source.includes('property="og:description"')) fail(file, "missing Open Graph description");
  if (!source.includes('name="twitter:description"')) fail(file, "missing Twitter description");
  if (!source.includes("assets/js/analytics.js")) fail(file, "missing analytics instrumentation");
  if (!source.includes("assets/js/app.js")) fail(file, "missing application script");
  if (file !== "404.html" && !source.includes('type="application/ld+json"')) fail(file, "missing structured data");
  if (file !== "404.html" && !/<link\s+rel="canonical"\s+href="https:\/\/aventuraksa\.com\//i.test(source)) fail(file, "missing target canonical");

  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) fail(file, `duplicate id: ${[...new Set(duplicateIds)].join(", ")}`);

  for (const match of source.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !fs.existsSync(target)) fail(file, `broken local reference: ${match[1]}`);
  }
}

const translationContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/translations.js"), "utf8"), translationContext);
const dictionaries = translationContext.window.AVENTURA_I18N;
const languages = ["en", "ar", "es"];
const counts = languages.map((language) => Object.keys(dictionaries[language] || {}).length);
if (new Set(counts).size !== 1) fail("translations", `language counts differ: ${counts.join(", ")}`);

const prefixes = new Set(Object.keys(dictionaries.en).map((key) => key.split(".")[0]));
const translationSources = htmlFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n") + fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const candidates = new Set();
for (const match of translationSources.matchAll(/["']([a-z][A-Za-z0-9]*\.[A-Za-z0-9.]+)["']/g)) {
  if (prefixes.has(match[1].split(".")[0]) && !/\.(?:html|webp|svg|jpg|js|css)$/i.test(match[1])) candidates.add(match[1]);
}
for (const key of candidates) {
  if (Object.keys(dictionaries.en).some((known) => known.startsWith(key) && known !== key)) continue;
  for (const language of languages) {
    if (!Object.prototype.hasOwnProperty.call(dictionaries[language], key)) fail("translations", `missing ${language} key: ${key}`);
  }
}

const searchableText = translationSources + JSON.stringify(dictionaries);
if (/\b(?:honey|miel)\b|عسل/iu.test(searchableText)) fail("content", "food product term found");

const appSource = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const collectionSource = fs.readFileSync(path.join(root, "collection.html"), "utf8");
const catalogMatch = appSource.match(/var BOUTIQUE_CATALOG = \{([\s\S]*?)\n  \};/);
if (!catalogMatch) {
  fail("assets/js/app.js", "missing boutique catalog");
} else {
  const catalogSource = catalogMatch[1];
  const catalogEntries = [...catalogSource.matchAll(/^    "([^"]+)": \{([^\n]+)\},?$/gm)];
  const boxIds = catalogEntries
    .filter(([, , entry]) => /\btype: "box"/.test(entry))
    .map(([, id]) => id)
    .sort();
  const expectedBoxIds = ["desert-box", "historic-box", "sea-box", "taif-box"];
  if (boxIds.join(",") !== expectedBoxIds.join(",")) {
    fail("boutique", `expected exactly four approved boxes; found ${boxIds.join(", ") || "none"}`);
  }

  const fragranceEntries = catalogEntries.filter(([, , entry]) => /\btype: "fragrance"/.test(entry));
  if (!fragranceEntries.length || fragranceEntries.some(([, , entry]) => !/actionKey: "collection\.registerInterest"/.test(entry))) {
    fail("boutique", "every Scent Lab fragrance must use the interest-only action");
  }

  ["executive-box", "jeddah-signature-box"].forEach((id) => {
    if (new RegExp(`"${id}"\\s*:`).test(catalogSource)) {
      fail("boutique", `retired box remains in catalog: ${id}`);
    }
  });
}

const collectionBoxIds = [...collectionSource.matchAll(/data-quote-item="([^"]+-box)"/g)].map((match) => match[1]).sort();
if (collectionBoxIds.join(",") !== ["desert-box", "historic-box", "sea-box", "taif-box"].join(",")) {
  fail("collection.html", `expected four approved box cards; found ${collectionBoxIds.join(", ") || "none"}`);
}
if (/data-quote-item="perfume-/i.test(collectionSource) || !collectionSource.includes("data-scent-interest")) {
  fail("collection.html", "Scent Lab must use its separate interest action, never a quote action");
}
if (!appSource.includes("function setupScentLabInterest") || !appSource.includes("[data-scent-interest], [data-interest-item]")) {
  fail("assets/js/app.js", "missing compatible Scent Lab interest handler");
}
const scentHandler = appSource.slice(appSource.indexOf("function setupScentLabInterest"), appSource.indexOf("function setupBoutiqueCatalog"));
if (!scentHandler.includes('"https://wa.me/"') || !scentHandler.includes('window.open(scentInterestUrl(product), "_blank", "noopener")')) {
  fail("assets/js/app.js", "Scent Lab interest CTA must open a non-personal WhatsApp message");
}
if (!appSource.includes("function sanitizeQuoteSelection") || !appSource.includes("isRequestableProduct(product)")) {
  fail("assets/js/app.js", "quote selection must discard retired and interest-only entries");
}
if (!appSource.includes('window.addEventListener("popstate"') || !appSource.includes('if (type === "fragrance")') || !appSource.includes('showScentLab("replace")')) {
  fail("assets/js/app.js", "boutique URL filters must restore navigation and route Fragrance to Scent Lab");
}

const contactBlock = appSource.slice(appSource.indexOf("function setupContactForm()"));
const requestKeyBlock = contactBlock.slice(contactBlock.indexOf("var requestKeys = {"), contactBlock.indexOf("var requestedItem"));
const contactTargets = [...htmlFiles]
  .flatMap((file) => [...fs.readFileSync(path.join(root, file), "utf8").matchAll(/contact\.html\?[^"']*?(?:request|service)=([^&"']+)/g)])
  .map((match) => match[1].replace(/&amp;$/i, ""));
for (const id of new Set(contactTargets)) {
  if (new RegExp(`"${id}"\\s*:`).test(requestKeyBlock)) continue;
  if (catalogMatch && new RegExp(`"${id}"\\s*:`).test(catalogMatch[1])) continue;
  fail("contact", `missing request key for linked item: ${id}`);
}
if (!contactBlock.includes('query.get("request") || query.get("service")')) {
  fail("contact", "service request links must prefill the request form");
}
if (!/\["name", "company", "phone", "email", "preferredResponse"\]\.forEach\(function \(name\) \{ moveField\(name, thirdGrid\); \}\);/.test(contactBlock) || !contactBlock.includes('["preferredResponse", "contact.preferredContactLabel"]')) {
  fail("contact", "preferred response field is not included in the final request step and WhatsApp details");
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const file of publicFiles) {
  const expected = file === "index.html" ? "https://aventuraksa.com/" : `https://aventuraksa.com/${file}`;
  if (!sitemap.includes(`<loc>${expected}</loc>`)) fail("sitemap.xml", `missing ${file}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, ${publicFiles.length} public URLs and ${counts[0]} keys in each of 3 languages.`);

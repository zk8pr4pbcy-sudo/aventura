import { chromium } from "playwright";

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    return;
  }
  failures += 1;
  console.error(`✗ ${message}`);
}

async function waitForSeo() {
  await page.waitForFunction(() => Boolean(window.AVENTURA_SEO && window.AVENTURA_SEO.version === "1.0.0"));
  await page.waitForTimeout(50);
}

async function metadataSnapshot() {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
    canonical: document.querySelector('link[rel="canonical"]')?.href || "",
    hreflangs: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((link) => [link.hreflang, link.href]),
    dynamicSchemaCount: document.querySelectorAll('script[data-aventura-seo-schema]').length,
    staticSchemaCount: document.querySelectorAll('script[type="application/ld+json"]:not([data-aventura-seo-schema])').length,
    title: document.title
  }));
}

try {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForSeo();
  let meta = await metadataSnapshot();
  check(meta.lang === "ar", "homepage defaults to Arabic");
  check(meta.robots.startsWith("index, follow"), "homepage remains indexable after runtime SEO refresh");
  check(meta.canonical === `${baseUrl}/` || meta.canonical === "https://aventuraksa.com/", "homepage canonical remains the Arabic/default URL");
  check(meta.hreflangs.length === 4, "homepage exposes four hreflang links including x-default");
  check(meta.dynamicSchemaCount === 0, "homepage has no runtime-generated duplicate JSON-LD");
  check(meta.staticSchemaCount >= 1, "homepage keeps its static structured data");

  await page.goto(`${baseUrl}/?lang=en`, { waitUntil: "domcontentloaded" });
  await waitForSeo();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  await page.waitForTimeout(50);
  meta = await metadataSnapshot();
  check(meta.lang === "en", "English query parameter selects English");
  check(meta.canonical.endsWith("/?lang=en"), "English runtime canonical matches the current phase-one URL strategy");
  check(meta.hreflangs.some(([lang, href]) => lang === "ar" && !href.includes("?lang=")), "English page points hreflang ar to the default URL");
  check(meta.hreflangs.some(([lang, href]) => lang === "es" && href.includes("?lang=es")), "English page retains Spanish alternate URL");
  check(meta.dynamicSchemaCount === 0, "English runtime does not add duplicate JSON-LD");

  await page.goto(`${baseUrl}/404.html`, { waitUntil: "domcontentloaded" });
  await waitForSeo();
  meta = await metadataSnapshot();
  check(meta.robots === "noindex, follow", "404 stays noindex after all JavaScript executes");
  check(meta.hreflangs.length === 0, "404 does not advertise indexable language alternates");
  check(meta.dynamicSchemaCount === 0, "404 does not receive dynamic structured data");

  await page.goto(`${baseUrl}/event-request/?source=seo-test`, { waitUntil: "domcontentloaded" });
  await waitForSeo();
  meta = await metadataSnapshot();
  check(meta.robots === "noindex, follow", "event request stays noindex after all JavaScript executes");
  check(meta.canonical.endsWith("/event-request/"), "event request keeps its utility-route canonical");
  check(meta.hreflangs.length === 0, "event request does not advertise indexable language alternates");
  check(meta.dynamicSchemaCount === 0, "event request does not receive duplicate runtime JSON-LD");
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} SEO browser check(s) failed.`);
  process.exit(1);
}

console.log("\nAventura SEO browser checks passed.");

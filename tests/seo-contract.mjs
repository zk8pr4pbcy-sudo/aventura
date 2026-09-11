import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let failures = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    return;
  }
  failures += 1;
  console.error(`✗ ${message}`);
}

console.log("\nAventura SEO phase-one contract\n");

const seoPath = "assets/js/seo-runtime.js";
const ga4Path = "assets/js/ga4.js";
const seo = read(seoPath);
const ga4 = read(ga4Path);
const robots = read("robots.txt");
const sitemapIndex = read("sitemap.xml");
const sitemapAr = read("sitemap-ar.xml");
const sitemapEn = read("sitemap-en.xml");
const sitemapEs = read("sitemap-es.xml");
const notFound = read("404.html");
const eventRequest = read("event-request/index.html");
const expectedLastmod = "2026-09-11";

check(fs.existsSync(path.join(root, seoPath)), "dedicated SEO runtime exists");
check(seo.includes("root.AVENTURA_SEO = api"), "SEO runtime exposes a stable AVENTURA_SEO API");
check(ga4.includes('assets/js/seo-runtime.js?v=20260911'), "ga4 bootstrap loads the dedicated SEO runtime");
check(ga4.includes('data-aventura-seo-runtime'), "SEO runtime bootstrap is duplicate-safe");

check(!ga4.includes("function applySeoEnhancements"), "ga4 no longer owns active SEO metadata enhancement");
check(!ga4.includes("function setSeoStructuredData"), "ga4 no longer generates structured data");
check(!ga4.includes("function setCanonicalAndAlternates"), "ga4 no longer owns canonical or hreflang generation");
check(!ga4.includes('meta[name="robots"]'), "ga4 no longer rewrites robots directives");

check(seo.includes('page === "notfound"') && seo.includes('page === "event-request"'), "SEO runtime explicitly protects private/noindex routes");
check(seo.includes("noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS"), "SEO runtime preserves noindex instead of forcing index");
check(seo.includes('script[data-aventura-seo-schema]') && seo.includes("node.remove()"), "SEO runtime removes any legacy dynamic schema copy");
check(!seo.includes('schema.textContent = JSON.stringify'), "SEO runtime does not create a second JSON-LD graph");

check(seo.includes("PRIORITY_PAGE_METADATA"), "SEO runtime owns focused metadata for priority commercial pages");
for (const priorityPath of [
  "/experiences.html",
  "/experience-historic-jeddah.html",
  "/experience-sea.html",
  "/corporate.html",
  "/services.html"
]) {
  check(seo.includes(`\"${priorityPath}\"`), `priority SEO metadata includes ${priorityPath}`);
}
check(seo.includes("تجارب وجولات خاصة في جدة والسعودية | أفنتورا"), "Arabic experience-index title targets useful search intent");
check(seo.includes("Private Tours & Experiences in Jeddah | AVENTURA"), "English experience-index title targets useful search intent");
check(seo.includes("Tours y experiencias privadas en Yeda | AVENTURA"), "Spanish experience-index title targets useful search intent");
check(seo.includes("جولة خاصة في جدة التاريخية مع مرشد مرخص | أفنتورا"), "Historic Jeddah metadata targets private licensed-guided search intent");
check(seo.includes("رحلات بحرية خاصة في جدة والبحر الأحمر | أفنتورا"), "Red Sea metadata targets private Jeddah sea-trip search intent");
check(!seo.includes('name="keywords"'), "priority SEO does not add obsolete meta keywords");

check(/<meta\s+name="robots"\s+content="noindex, follow"/i.test(notFound), "404 remains statically noindex");
check(/<meta\s+name="robots"\s+content="noindex, follow"/i.test(eventRequest), "event request remains statically noindex");

for (const [name, source] of [
  ["sitemap.xml", sitemapIndex],
  ["sitemap-ar.xml", sitemapAr],
  ["sitemap-en.xml", sitemapEn],
  ["sitemap-es.xml", sitemapEs]
]) {
  const lastmods = [...source.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  check(lastmods.length > 0, `${name} contains lastmod values`);
  check(lastmods.every((value) => value === expectedLastmod), `${name} lastmod is refreshed to ${expectedLastmod}`);
}

for (const [name, source] of [
  ["sitemap-ar.xml", sitemapAr],
  ["sitemap-en.xml", sitemapEn],
  ["sitemap-es.xml", sitemapEs]
]) {
  check(!source.includes("404.html"), `${name} excludes the 404 page`);
  check(!source.includes("/event-request/"), `${name} excludes the noindex event-request flow`);
}

check(sitemapEn.includes("?lang=en"), "phase one preserves current English query-parameter URLs");
check(sitemapEs.includes("?lang=es"), "phase one preserves current Spanish query-parameter URLs");
check(!sitemapAr.includes("?lang="), "Arabic remains the canonical default URL set");
check(robots.includes("Sitemap: https://aventuraksa.com/sitemap.xml"), "robots.txt advertises the sitemap index");

check(sitemapIndex.includes("sitemap-ar.xml") && sitemapIndex.includes("sitemap-en.xml") && sitemapIndex.includes("sitemap-es.xml"), "sitemap index keeps all three language maps");

if (failures) {
  console.error(`\n${failures} SEO contract check(s) failed.`);
  process.exit(1);
}

console.log("\nAventura SEO phase-one contract passed.");

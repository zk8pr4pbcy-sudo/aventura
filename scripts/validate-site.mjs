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
[
  "assets/js/translations.js",
  "assets/js/home-phase1-i18n.js",
  "assets/js/home-brand-reset.js"
].forEach((sourceFile) => {
  vm.runInNewContext(fs.readFileSync(path.join(root, sourceFile), "utf8"), translationContext);
});
const dictionaries = translationContext.window.AVENTURA_I18N;
const languages = ["en", "ar", "es"];
const counts = languages.map((language) => Object.keys(dictionaries[language] || {}).length);
if (new Set(counts).size !== 1) fail("translations", `language counts differ: ${counts.join(", ")}`);

const prefixes = new Set(Object.keys(dictionaries.en).map((key) => key.split(".")[0]));
const translationSources = htmlFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n") + [
  "assets/js/app.js",
  "assets/js/home-phase1-i18n.js",
  "assets/js/home-brand-reset.js"
].map((sourceFile) => fs.readFileSync(path.join(root, sourceFile), "utf8")).join("\n");
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
if (/\bluxury\b|فاخر/iu.test(searchableText)) fail("content", "disallowed luxury language found");

const appSource = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const collectionSource = fs.readFileSync(path.join(root, "collection.html"), "utf8");
const catalogMatch = appSource.match(/var BOUTIQUE_CATALOG = \{([\s\S]*?)\n  \};/);
if (!catalogMatch) {
  fail("assets/js/app.js", "missing boutique catalog");
} else {
  const catalogSource = catalogMatch[1];
  const catalogEntries = [...catalogSource.matchAll(/^    "([^"]+)": \{([^\n]+)\},?$/gm)];
  const allowedTypes = ["fragrance", "box", "beach", "gift"];
  if (catalogEntries.some(([, , entry]) => !allowedTypes.some((type) => entry.includes(`type: "${type}"`)))) {
    fail("boutique", "an unsupported item type remains in the public boutique catalog");
  }

  const fragranceEntries = catalogEntries.filter(([, , entry]) => /\btype: "fragrance"/.test(entry));
  const expectedFragranceIds = ["perfume-noir", "perfume-roshan", "perfume-sea", "perfume-taif", "perfume-velvet"];
  if (fragranceEntries.map(([, id]) => id).sort().join(",") !== expectedFragranceIds.join(",") || fragranceEntries.some(([, , entry]) => !/statusKey: "common\.comingSoon"/.test(entry) || !/prepKey: "collection\.prepDevelopment"/.test(entry) || /actionKey:/.test(entry))) {
    fail("boutique", "every fragrance concept must remain visible as Coming Soon without a request action");
  }

  const expectedPreviewIds = [
    "desert-box", "desert-cup", "desert-glasses-case", "desert-keepsake", "desert-shawl",
    "heritage-cards", "historic-box", "historic-notebook", "historic-pouch", "roshan-keepsake",
    "sea-bottle", "sea-box", "sea-phone", "sea-tote", "sea-towel",
    "taif-box", "taif-notebook", "taif-rose-care", "taif-rose-mist", "taif-sachet"
  ];
  const previewEntries = catalogEntries.filter(([, id]) => expectedPreviewIds.includes(id));
  if (previewEntries.map(([, id]) => id).sort().join(",") !== expectedPreviewIds.join(",") || previewEntries.some(([, , entry]) => !/statusKey: "common\.comingSoon"/.test(entry) || !/prepKey: "collection\.prepDevelopment"/.test(entry) || /actionKey:/.test(entry))) {
    fail("boutique", "every product and box preview must remain visible as Coming Soon without a request action");
  }
  const boxIds = catalogEntries.filter(([, , entry]) => /\btype: "box"/.test(entry)).map(([, id]) => id).sort();
  if (boxIds.join(",") !== ["desert-box", "historic-box", "sea-box", "taif-box"].join(",")) {
    fail("boutique", "only the four experience boxes may appear in the boutique");
  }
  ["executive-box", "jeddah-signature-box", "perfume-last-light"].forEach((id) => {
    if (new RegExp(`"${id}"\\s*:`).test(catalogSource)) {
      fail("boutique", `retired item remains in catalog: ${id}`);
    }
  });
}

const collectionInterestIds = [...collectionSource.matchAll(/data-interest-item="(perfume-[^"]+)"/g)].map((match) => match[1]).sort();
const expectedFragrancePreviewIds = ["perfume-noir", "perfume-roshan", "perfume-sea", "perfume-taif", "perfume-velvet"];
const expectedCollectionProductIds = [
  ...expectedFragrancePreviewIds,
  "desert-box", "desert-cup", "desert-glasses-case", "desert-keepsake", "desert-shawl",
  "heritage-cards", "historic-box", "historic-notebook", "historic-pouch", "roshan-keepsake",
  "sea-bottle", "sea-box", "sea-phone", "sea-tote", "sea-towel",
  "taif-box", "taif-notebook", "taif-rose-care", "taif-rose-mist", "taif-sachet"
].sort();
const collectionProductIds = [...collectionSource.matchAll(/data-product-id="([^"]+)"/g)].map((match) => match[1]).sort();
if (/data-(?:quote|interest)-item=/i.test(collectionSource)) {
  fail("collection.html", "Coming Soon products, boxes and fragrances must not expose request controls");
}
if (collectionInterestIds.length) {
  fail("collection.html", "fragrance concepts must not expose an interest action before launch");
}
if (collectionProductIds.join(",") !== expectedCollectionProductIds.join(",")) {
  fail("collection.html", "all approved boutique boxes and product previews must remain visible");
}
if (/data-(?:quote|interest)-item="perfume-/i.test(collectionSource)) {
  fail("collection.html", "fragrance concepts must remain Coming Soon without a request action");
}
if (appSource.includes("collection.registerInterest") || appSource.includes("function setupScentLabInterest")) {
  fail("assets/js/app.js", "fragrance concepts must not retain an interest workflow before launch");
}
if (!appSource.includes("function sanitizeQuoteSelection") || !appSource.includes("isRequestableProduct(product)")) {
  fail("assets/js/app.js", "quote selection must discard unavailable entries");
}
if (!appSource.includes('window.addEventListener("popstate"') || !appSource.includes('var allowedTypes = ["all", "fragrance", "box", "beach", "gift"]') || !appSource.includes('var allowedExperiences = ["all", "sea", "historic", "desert", "taif", "jeddah"]')) {
  fail("assets/js/app.js", "boutique URL filters must restore the selected experience and item view");
}
if (!appSource.includes("function isVisibleBoutiqueProduct") || !appSource.includes('["fragrance", "box", "beach", "gift"]')) {
  fail("assets/js/app.js", "the public boutique must keep fragrances, boxes and product previews visible");
}
if (!appSource.includes('var id = item.getAttribute("data-product-id")')) {
  fail("assets/js/app.js", "Coming Soon previews must be supported without a purchase or interest action");
}

const guestServicesSource = fs.readFileSync(path.join(root, "guest-services.html"), "utf8");
const guestServiceRequests = [...guestServicesSource.matchAll(/request=(thobe|abaya|flower)/g)].map((match) => match[1]).sort();
if (guestServiceRequests.join(",") !== "abaya,flower,thobe" || /concierge|gift/i.test(guestServicesSource)) {
  fail("guest-services.html", "guest services must contain only thobe tailoring, abaya service and flowers");
}
if (!appSource.includes('data-nav="guest-services"') || !appSource.includes('href="guest-services.html"')) {
  fail("assets/js/app.js", "guest services must be reachable from the header and footer");
}

const primaryExperiencePages = {
  "experience-historic-jeddah.html": "historic",
  "experience-sea.html": "sea",
  "experience-desert.html": "desert",
  "experience-taif.html": "taif",
  "experience-jeddah-day.html": "jeddah",
  "experience-sea-to-balad.html": "sea-to-balad"
};
for (const [file, experienceId] of Object.entries(primaryExperiencePages)) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!source.includes("data-static-experience-story")) {
    fail(file, "must keep its localized experience story ahead of optional fragrances");
  }
  if (!source.includes(`data-experience-detail data-experience-id="${experienceId}"`)) {
    fail(file, "missing the correct experience fragrance mapping");
  }
  if (count(source, /id="experience-journey"/g) !== 1) {
    fail(file, "must contain exactly one visitor journey section");
  }
}

function perfumeIdsBetween(startToken, endToken) {
  const start = appSource.indexOf(startToken);
  const end = start === -1 ? -1 : appSource.indexOf(endToken, start + startToken.length);
  if (start === -1 || end === -1) return null;
  return [...appSource.slice(start, end).matchAll(/id: "(perfume-[^"]+)"/g)].map((match) => match[1]).sort();
}

const jeddahPerfumes = perfumeIdsBetween('      jeddah: {', '      "sea-to-balad": {');
const seaToBaladPerfumes = perfumeIdsBetween('      "sea-to-balad": {', '\n    };\n\n    var experienceId');
const desertPerfumes = perfumeIdsBetween('      desert: {', '      taif: {');
if (!jeddahPerfumes || jeddahPerfumes.join(",") !== "perfume-noir,perfume-velvet") {
  fail("assets/js/app.js", "Jeddah Day must expose only Noir and Velvet fragrance concepts");
}
if (!seaToBaladPerfumes || seaToBaladPerfumes.join(",") !== "perfume-roshan,perfume-sea") {
  fail("assets/js/app.js", "Sea to Al-Balad must expose only Sea and Roshan fragrance concepts");
}
if (!desertPerfumes || desertPerfumes.length) {
  fail("assets/js/app.js", "the desert experience must not expose an incomplete fragrance concept");
}

[
  ["experience-jeddah-day.html", "world-jeddah"],
  ["experience-sea-to-balad.html", "world-sea-to-balad"]
].forEach(([file, worldClass]) => {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (!source.includes(`class="experience-world ${worldClass}"`) || !source.includes("world-dual-portrait")) {
    fail(file, "must retain its own dual-world visual treatment rather than inherit the Historic Jeddah world");
  }
});

const quoteControlFiles = publicFiles.filter((file) => /data-quote-item=/i.test(fs.readFileSync(path.join(root, file), "utf8")));
if (quoteControlFiles.length) {
  fail("public boutique", `quote controls are not allowed for concepts in development: ${quoteControlFiles.join(", ")}`);
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
  fail("contact", "preferred response field is not included in the final request step and request details");
}
const contactSource = fs.readFileSync(path.join(root, "contact.html"), "utf8");
if (!appSource.includes('var REQUEST_EMAIL = "contact@aventuraksa.com"') || !appSource.includes('var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com"') || !contactSource.includes('action="https://formsubmit.co/contact@aventuraksa.com"') || !contactSource.includes('method="POST"') || !/name="submissionChannel" value="email" checked[\s\S]*name="submissionChannel" value="whatsapp"/.test(contactSource) || !contactBlock.includes('var submissionChannel = String(data.get("submissionChannel") || "email")') || !contactBlock.includes('sendRequestWithFormSubmit(submissionData)') || contactBlock.includes('"mailto:" + REQUEST_EMAIL')) {
  fail("contact", "booking requests must submit automatically to contact@aventuraksa.com with WhatsApp as the second option");
}
if (/amassiri@aventuraksa\.com|Waseem@aventuraksa\.com/i.test(searchableText)) {
  fail("contact", "retired public email addresses remain in the site");
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
if (/sunset-moment|experience-sunset-moment/i.test(searchableText + sitemap) || htmlFiles.includes("experience-sunset-moment.html")) {
  fail("experiences", "the retired 30-minute Sunset Moment program remains public");
}
const customDomainPath = path.join(root, "CNAME");
if (fs.existsSync(customDomainPath) && fs.readFileSync(customDomainPath, "utf8").trim() !== "aventuraksa.com") {
  fail("CNAME", "must point GitHub Pages at aventuraksa.com when the custom domain is enabled");
}
for (const file of publicFiles) {
  const expected = file === "index.html" ? "https://aventuraksa.com/" : `https://aventuraksa.com/${file}`;
  if (!sitemap.includes(`<loc>${expected}</loc>`)) fail("sitemap.xml", `missing ${file}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, ${publicFiles.length} public URLs and ${counts[0]} keys in each of 3 languages.`);

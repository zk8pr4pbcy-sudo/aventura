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
  await page.waitForFunction(() => Boolean(
    window.AVENTURA_SEO && typeof window.AVENTURA_SEO.refresh === "function"
  ));
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
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") || ""
  }));
}

const priorityPages = [
  {
    path: "/experiences.html",
    titles: {
      ar: "تجارب وجولات خاصة في جدة والسعودية | أفنتورا",
      en: "Private Tours & Experiences in Jeddah | AVENTURA",
      es: "Tours y experiencias privadas en Yeda | AVENTURA"
    }
  },
  {
    path: "/experience-historic-jeddah.html",
    titles: {
      ar: "جولة خاصة في جدة التاريخية مع مرشد مرخص | أفنتورا",
      en: "Private Historic Jeddah Tour with Licensed Guide | AVENTURA",
      es: "Tour privado por la Yeda histórica con guía | AVENTURA"
    }
  },
  {
    path: "/experience-sea.html",
    titles: {
      ar: "رحلات بحرية خاصة في جدة والبحر الأحمر | أفنتورا",
      en: "Private Red Sea Boat & Yacht Experiences in Jeddah | AVENTURA",
      es: "Paseos privados en barco por el Mar Rojo en Yeda | AVENTURA"
    }
  },
  {
    path: "/corporate.html",
    titles: {
      ar: "تنظيم فعاليات الشركات واستضافة الوفود في جدة | أفنتورا",
      en: "Corporate Events & Executive Guest Programs in Jeddah | AVENTURA",
      es: "Eventos corporativos y programas ejecutivos en Yeda | AVENTURA"
    }
  },
  {
    path: "/services.html",
    titles: {
      ar: "خدمات الضيوف والكونسيرج وإدارة الوجهات في جدة | أفنتورا",
      en: "Guest, Concierge & Destination Services in Jeddah | AVENTURA",
      es: "Servicios de concierge y gestión de destino en Yeda | AVENTURA"
    }
  }
];

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

  for (const priority of priorityPages) {
    for (const lang of ["ar", "en", "es"]) {
      const suffix = `?lang=${lang}`;
      await page.goto(`${baseUrl}${priority.path}${suffix}`, { waitUntil: "domcontentloaded" });
      await waitForSeo();
      await page.waitForFunction((expected) => document.documentElement.lang === expected.lang && document.title === expected.title, {
        lang,
        title: priority.titles[lang]
      });
      meta = await metadataSnapshot();
      check(meta.title === priority.titles[lang], `${priority.path} ${lang}: priority search title is active`);
      check(meta.description.length >= 80, `${priority.path} ${lang}: priority meta description is substantive`);
      check(meta.robots.startsWith("index, follow"), `${priority.path} ${lang}: priority page remains indexable`);
      check(meta.hreflangs.length === 4, `${priority.path} ${lang}: priority page keeps all hreflang alternates`);
      if (lang === "ar") {
        check(!meta.canonical.includes("?lang="), `${priority.path} ar: default canonical stays query-free`);
      }
    }
  }

  // Exercise the real in-page language controls on a priority commercial page.
  // app.js translates the interface first; seo-runtime must remain the final
  // authority for search metadata after each language event.
  const switchPage = priorityPages[0];
  await page.goto(`${baseUrl}${switchPage.path}?lang=ar`, { waitUntil: "domcontentloaded" });
  await waitForSeo();
  for (const lang of ["en", "es", "ar"]) {
    await page.click(`[data-language="${lang}"]`);
    await page.waitForFunction((expected) => document.documentElement.lang === expected.lang && document.title === expected.title, {
      lang,
      title: switchPage.titles[lang]
    });
    meta = await metadataSnapshot();
    check(meta.title === switchPage.titles[lang], `${switchPage.path} live switch ${lang}: priority title remains authoritative`);
    check(lang === "ar" ? !meta.canonical.includes("?lang=") : meta.canonical.endsWith(`?lang=${lang}`), `${switchPage.path} live switch ${lang}: canonical follows active language`);
  }

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

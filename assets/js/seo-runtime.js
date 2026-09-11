(function (root) {
  "use strict";

  var SUPPORTED_LANGUAGES = ["ar", "en", "es"];
  var DEFAULT_LANGUAGE = "ar";
  var SITE_ORIGIN = "https://aventuraksa.com";
  var INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  var NOINDEX_ROBOTS = "noindex, follow";

  /*
   * Priority commercial pages use search-intent metadata here so one focused
   * SEO owner controls the localized title/description shown after language
   * switching. The Arabic HTML remains the static/default source for crawlers.
   */
  var PRIORITY_PAGE_METADATA = Object.freeze({
    "/experiences.html": Object.freeze({
      ar: Object.freeze({
        title: "تجارب وجولات خاصة في جدة والسعودية | أفنتورا",
        description: "اكتشف تجارب وجولات خاصة في جدة تشمل جدة التاريخية والبحر الأحمر والصحراء والطائف، مع تنسيق النقل والمرشدين والخدمات حسب الطلب."
      }),
      en: Object.freeze({
        title: "Private Tours & Experiences in Jeddah | AVENTURA",
        description: "Discover private Jeddah experiences across Historic Jeddah, the Red Sea, desert and Taif, with guides, transport and guest services coordinated around you."
      }),
      es: Object.freeze({
        title: "Tours y experiencias privadas en Yeda | AVENTURA",
        description: "Descubre experiencias privadas en Yeda: la Yeda histórica, el Mar Rojo, el desierto y Taif, con guías, transporte y servicios coordinados a tu medida."
      })
    }),
    "/experience-historic-jeddah.html": Object.freeze({
      ar: Object.freeze({
        title: "جولة خاصة في جدة التاريخية مع مرشد مرخص | أفنتورا",
        description: "جولة مشي خاصة في البلد بجدة التاريخية مع مرشد سياحي مرخص، تشمل القهوة السعودية والتمر ومحطات تراثية مختارة، مع خيارات النقل حسب الطلب."
      }),
      en: Object.freeze({
        title: "Private Historic Jeddah Tour with Licensed Guide | AVENTURA",
        description: "Explore Al-Balad on a private Historic Jeddah walking tour with a licensed guide, Saudi coffee, dates and selected heritage stops, with transport available."
      }),
      es: Object.freeze({
        title: "Tour privado por la Yeda histórica con guía | AVENTURA",
        description: "Recorre Al-Balad en un tour privado por la Yeda histórica con guía acreditado, café saudí, dátiles y paradas patrimoniales seleccionadas."
      })
    }),
    "/experience-sea.html": Object.freeze({
      ar: Object.freeze({
        title: "رحلات بحرية خاصة في جدة والبحر الأحمر | أفنتورا",
        description: "رحلات بحرية خاصة من أبحر في جدة تشمل خيارات القوارب واليخوت ورحلات الغروب وبياضة، مع تنسيق التوقيت والخدمات حسب حجم المجموعة."
      }),
      en: Object.freeze({
        title: "Private Red Sea Boat & Yacht Experiences in Jeddah | AVENTURA",
        description: "Private Red Sea experiences from Obhur, Jeddah, including boat and yacht options, sunset journeys and Bayadah sea days coordinated around your group."
      }),
      es: Object.freeze({
        title: "Paseos privados en barco por el Mar Rojo en Yeda | AVENTURA",
        description: "Experiencias privadas desde Obhur, Yeda, con barcos y yates, salidas al atardecer y días en Bayadah coordinados según tu grupo."
      })
    }),
    "/corporate.html": Object.freeze({
      ar: Object.freeze({
        title: "تنظيم فعاليات الشركات واستضافة الوفود في جدة | أفنتورا",
        description: "تنظيم فعاليات الشركات والاجتماعات التنفيذية وبرامج الفرق واستضافة الوفود في جدة، مع النقل والضيافة والتنسيق الميداني ضمن خطة واحدة."
      }),
      en: Object.freeze({
        title: "Corporate Events & Executive Guest Programs in Jeddah | AVENTURA",
        description: "Corporate events, executive meetings, team programs and delegation hosting in Jeddah, with transport, hospitality and on-site coordination in one plan."
      }),
      es: Object.freeze({
        title: "Eventos corporativos y programas ejecutivos en Yeda | AVENTURA",
        description: "Eventos corporativos, reuniones ejecutivas, programas de equipo y recepción de delegaciones en Yeda con transporte, hospitalidad y coordinación."
      })
    }),
    "/services.html": Object.freeze({
      ar: Object.freeze({
        title: "خدمات الضيوف والكونسيرج وإدارة الوجهات في جدة | أفنتورا",
        description: "خدمات كونسيرج ونقل خاص ومرشدين سياحيين مرخصين واستقبال وضيافة وإدارة وجهات في جدة والسعودية، للأفراد والشركات والوفود."
      }),
      en: Object.freeze({
        title: "Guest, Concierge & Destination Services in Jeddah | AVENTURA",
        description: "Concierge, private transport, licensed guides, meet and assist, guest hospitality and destination management services in Jeddah and Saudi Arabia."
      }),
      es: Object.freeze({
        title: "Servicios de concierge y gestión de destino en Yeda | AVENTURA",
        description: "Concierge, transporte privado, guías acreditados, recepción, hospitalidad y gestión de destino en Yeda y Arabia Saudí para viajeros y empresas."
      })
    })
  });

  function normalizeLanguage(value) {
    var language = String(value || "").toLowerCase();
    return SUPPORTED_LANGUAGES.indexOf(language) === -1 ? DEFAULT_LANGUAGE : language;
  }

  function currentLanguage() {
    return normalizeLanguage(document.documentElement && document.documentElement.lang);
  }

  function currentDictionary() {
    var dictionaries = root.AVENTURA_I18N || {};
    var language = currentLanguage();
    return dictionaries[language] || dictionaries[DEFAULT_LANGUAGE] || dictionaries.en || {};
  }

  function pagePath() {
    var path = root.location && root.location.pathname ? root.location.pathname : "/";
    if (/\/index\.html$/i.test(path)) path = path.replace(/index\.html$/i, "");
    if (!path) path = "/";
    return path.charAt(0) === "/" ? path : "/" + path;
  }

  function urlFor(language, path) {
    var normalized = normalizeLanguage(language);
    var base = SITE_ORIGIN + (path || pagePath());
    return normalized === DEFAULT_LANGUAGE ? base : base + "?lang=" + encodeURIComponent(normalized);
  }

  function priorityMetadata(language, path) {
    var page = PRIORITY_PAGE_METADATA[path || pagePath()];
    if (!page) return null;
    return page[normalizeLanguage(language)] || page[DEFAULT_LANGUAGE] || null;
  }

  function upsertMeta(selector, attributes, content) {
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      Object.keys(attributes || {}).forEach(function (name) {
        node.setAttribute(name, attributes[name]);
      });
      document.head.appendChild(node);
    }
    node.setAttribute("content", content || "");
    return node;
  }

  function isNoindexPage() {
    var meta = document.head.querySelector('meta[name="robots"]');
    var declared = meta ? String(meta.getAttribute("content") || "") : "";
    var page = document.body ? document.body.getAttribute("data-page") || "" : "";
    return /\bnoindex\b/i.test(declared) || page === "notfound" || page === "event-request";
  }

  function syncCanonicalAndAlternates(language) {
    var noindex = isNoindexPage();
    var path = pagePath();
    var canonical = document.head.querySelector('link[rel="canonical"]');

    if (noindex) {
      var page = document.body ? document.body.getAttribute("data-page") || "" : "";
      document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (node) {
        node.remove();
      });
      // Transactional utility routes keep one stable canonical that never
      // inherits tracking or language query parameters. 404 intentionally has none.
      if (canonical && page === "event-request") canonical.href = SITE_ORIGIN + path;
      return canonical ? canonical.href : "";
    }

    var canonicalUrl = urlFor(language, path);
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (node) {
      node.remove();
    });

    [
      ["ar", urlFor("ar", path)],
      ["en", urlFor("en", path)],
      ["es", urlFor("es", path)],
      ["x-default", urlFor("ar", path)]
    ].forEach(function (row) {
      var link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = row[0];
      link.href = row[1];
      document.head.appendChild(link);
    });

    return canonicalUrl;
  }

  function removeLegacyDynamicSchema() {
    document.head.querySelectorAll('script[data-aventura-seo-schema]').forEach(function (node) {
      node.remove();
    });
  }

  function refresh() {
    if (!document.head || !document.body) return;

    var language = currentLanguage();
    var dictionary = currentDictionary();
    var path = pagePath();
    var metadata = priorityMetadata(language, path);
    var titleKey = document.body.getAttribute("data-title-key") || "";
    var descriptionKey = document.body.getAttribute("data-description-key") || "";
    var translatedTitle = metadata && metadata.title ? metadata.title : (titleKey && typeof dictionary[titleKey] === "string" ? dictionary[titleKey].trim() : "");
    var translatedDescription = metadata && metadata.description ? metadata.description : (descriptionKey && typeof dictionary[descriptionKey] === "string" ? dictionary[descriptionKey].trim() : "");
    var descriptionMeta = document.head.querySelector('meta[name="description"]');
    var pageTitle = translatedTitle || document.title || "AVENTURA";
    var pageDescription = translatedDescription || (descriptionMeta ? descriptionMeta.getAttribute("content") : "") || "Private experiences, events and guest hospitality in Jeddah and Saudi Arabia.";
    var noindex = isNoindexPage();
    var canonicalUrl = syncCanonicalAndAlternates(language);

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: "description" }, pageDescription);
    upsertMeta('meta[name="robots"]', { name: "robots" }, noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, pageTitle);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, pageDescription);
    if (canonicalUrl) upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "AVENTURA");
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, language === "ar" ? "ar_SA" : (language === "es" ? "es_ES" : "en_US"));
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, pageTitle);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, pageDescription);

    // Static JSON-LD in each HTML document is the single schema source of truth.
    // Remove the legacy dynamic copy if an older cached runtime inserted it first.
    removeLegacyDynamicSchema();
  }

  function scheduleRefresh() {
    root.setTimeout(refresh, 0);
  }

  var api = Object.freeze({
    version: "1.1.0",
    refresh: refresh,
    urlFor: urlFor,
    isNoindexPage: isNoindexPage
  });

  root.AVENTURA_SEO = api;

  document.addEventListener("aventura:language", scheduleRefresh);

  if (document.documentElement && typeof MutationObserver !== "undefined") {
    var languageObserver = new MutationObserver(function (mutations) {
      if (mutations.some(function (mutation) { return mutation.attributeName === "lang"; })) scheduleRefresh();
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRefresh, { once: true });
  } else {
    scheduleRefresh();
  }
}(typeof window !== "undefined" ? window : globalThis));
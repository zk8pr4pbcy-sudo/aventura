(function (root) {
  "use strict";

  var SUPPORTED_LANGUAGES = ["ar", "en", "es"];
  var DEFAULT_LANGUAGE = "ar";
  var SITE_ORIGIN = "https://aventuraksa.com";
  var INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  var NOINDEX_ROBOTS = "noindex, follow";

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
      document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (node) {
        node.remove();
      });
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
    var titleKey = document.body.getAttribute("data-title-key") || "";
    var descriptionKey = document.body.getAttribute("data-description-key") || "";
    var translatedTitle = titleKey && typeof dictionary[titleKey] === "string" ? dictionary[titleKey].trim() : "";
    var translatedDescription = descriptionKey && typeof dictionary[descriptionKey] === "string" ? dictionary[descriptionKey].trim() : "";
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
    version: "1.0.0",
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

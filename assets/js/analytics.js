(function () {
  "use strict";

  var SAFE_DETAIL_KEYS = ["page", "language", "target", "requestType", "requestId", "productId", "quantity", "source"];

  function cleanDetails(details) {
    var clean = {};
    details = details || {};
    SAFE_DETAIL_KEYS.forEach(function (key) {
      if (details[key] !== undefined && details[key] !== null && details[key] !== "") {
        clean[key] = String(details[key]).slice(0, 120);
      }
    });
    return clean;
  }

  function track(name, details) {
    var event = Object.assign({
      event: "aventura_" + name,
      page: document.body ? document.body.getAttribute("data-page") || "unknown" : "unknown",
      language: document.documentElement.lang || "en"
    }, cleanDetails(details));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
    document.dispatchEvent(new CustomEvent("aventura:analytics", { detail: event }));
  }

  window.AVENTURA_TRACK = track;

  document.addEventListener("click", function (event) {
    var control = event.target.closest("a, button");
    if (!control) {
      return;
    }

    var href = control.getAttribute("href") || "";
    if (href.indexOf("wa.me/") !== -1) {
      track("whatsapp_open", { source: control.className || "link" });
    } else if (control.matches("[data-experience-request]")) {
      track("quote_start", { source: "experience", target: href });
    } else if (control.matches("[data-quote-item]")) {
      track("boutique_selection", { productId: control.getAttribute("data-quote-item") });
    } else if (control.matches("[data-nav], [data-nav-alias]")) {
      track("navigation", { target: href });
    } else if (control.matches("[data-boutique-filter]")) {
      track("boutique_filter", { target: control.getAttribute("data-boutique-filter") });
    } else if (control.matches("[data-boutique-type]")) {
      track("boutique_filter", { target: control.getAttribute("data-boutique-type") });
    }
  });

  document.addEventListener("aventura:language", function (event) {
    track("language_change", { language: event.detail && event.detail.language });
  });

  function pageView() {
    track("page_view", {
      page: document.body ? document.body.getAttribute("data-page") : "unknown",
      language: document.documentElement.lang
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pageView, { once: true });
  } else {
    pageView();
  }
}());

(function () {
  "use strict";

  function currentLanguage() {
    var language = document.documentElement.lang || "ar";
    return window.AVENTURA_I18N && window.AVENTURA_I18N[language] ? language : "en";
  }

  function translated(key, fallback) {
    var language = currentLanguage();
    var dictionary = window.AVENTURA_I18N && window.AVENTURA_I18N[language];
    return dictionary && dictionary[key] ? dictionary[key] : fallback;
  }

  function createPendingLastLightCard(className) {
    var article = document.createElement("article");
    article.className = className;
    article.setAttribute("data-prelaunch-last-light", "");
    article.setAttribute("data-category", "desert");
    article.setAttribute("data-product-type", "fragrance");

    var content = document.createElement("div");
    var eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "LAST LIGHT";
    var title = document.createElement("strong");
    title.setAttribute("data-last-light-copy", "title");
    var description = document.createElement("p");
    description.setAttribute("data-last-light-copy", "text");
    var status = document.createElement("span");
    status.className = "status coming";
    status.setAttribute("data-last-light-copy", "status");
    var pending = document.createElement("small");
    pending.setAttribute("data-last-light-copy", "pending");

    content.appendChild(eyebrow);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(status);
    content.appendChild(pending);
    article.appendChild(content);
    return article;
  }

  function refreshLastLightCopy(scope) {
    (scope || document).querySelectorAll("[data-last-light-copy]").forEach(function (element) {
      var part = element.getAttribute("data-last-light-copy");
      if (part === "title") element.textContent = translated("collection.p3Title", "Last Light");
      if (part === "text") element.textContent = translated("collection.p3Text", "Dry woods, sun-warmed sand, vetiver and a mineral accord.");
      if (part === "status") element.textContent = translated("common.comingSoon", "Coming soon");
      if (part === "pending") element.textContent = translated("collection.lastLightPending", "Original campaign artwork pending");
    });
  }

  function syncBoutiqueLastLight() {
    var boutique = document.querySelector("[data-boutique]");
    var card = boutique && boutique.querySelector("[data-prelaunch-last-light]");
    if (!boutique || !card) return;

    var activeExperience = boutique.querySelector("[data-boutique-filter].is-active");
    var selected = activeExperience ? activeExperience.getAttribute("data-boutique-filter") : "all";
    var show = !selected || selected === "all" || selected === "desert";
    card.hidden = !show;

    if (show) {
      var fragranceSection = boutique.querySelector("#fragrances");
      if (fragranceSection) fragranceSection.hidden = false;
    }
  }

  function injectBoutiqueLastLight() {
    var boutique = document.querySelector("[data-boutique]");
    var grid = boutique && boutique.querySelector("#fragrances .perfume-grid");
    if (!grid || grid.querySelector("[data-prelaunch-last-light]")) return;

    var card = createPendingLastLightCard("perfume-card perfume-card-pending prelaunch-last-light-card");
    var position = grid.children[2] || null;
    grid.insertBefore(card, position);
    refreshLastLightCopy(card);
    syncBoutiqueLastLight();

    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(syncBoutiqueLastLight, 0);
      });
    });
  }

  function initialize() {
    window.setTimeout(injectBoutiqueLastLight, 80);
  }

  document.addEventListener("aventura:language", function () {
    window.setTimeout(function () {
      refreshLastLightCopy(document);
    }, 0);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());

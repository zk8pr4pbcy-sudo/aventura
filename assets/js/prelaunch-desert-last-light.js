(function () {
  "use strict";

  function language() {
    var lang = document.documentElement.lang || "ar";
    return window.AVENTURA_I18N && window.AVENTURA_I18N[lang] ? lang : "en";
  }

  function t(key, fallback) {
    var dictionary = window.AVENTURA_I18N && window.AVENTURA_I18N[language()];
    return dictionary && dictionary[key] ? dictionary[key] : fallback;
  }

  function updateCopy(section) {
    if (!section) return;
    var heading = section.querySelector("[data-last-light-heading]");
    var description = section.querySelector("[data-last-light-description]");
    var status = section.querySelector("[data-last-light-status]");
    var pending = section.querySelector("[data-last-light-pending]");
    if (heading) heading.textContent = t("collection.p3Title", "Last Light");
    if (description) description.textContent = t("collection.p3Text", "Dry woods, sun-warmed sand, vetiver and a mineral accord.");
    if (status) status.textContent = t("common.comingSoon", "Coming soon");
    if (pending) pending.textContent = t("collection.lastLightPending", "Original campaign artwork pending");
  }

  function inject() {
    if (!document.body.classList.contains("world-desert")) return;
    var root = document.querySelector('[data-experience-detail][data-experience-id="desert"]');
    if (!root || root.querySelector(".prelaunch-last-light-section")) return;

    var section = document.createElement("section");
    section.className = "section section-muted prelaunch-last-light-section";
    section.setAttribute("data-prelaunch-last-light", "");
    section.innerHTML = '<div class="container"><div class="section-heading"><div><span class="eyebrow">AVENTURA SCENT LAB</span><h2 data-last-light-heading></h2></div><p data-last-light-description></p></div><div class="detail-product-grid"><article class="catalog-product-card detail-perfume-product perfume-card-pending"><div><span class="eyebrow">LAST LIGHT</span><strong data-last-light-heading></strong><p data-last-light-description></p><span class="status coming" data-last-light-status></span><small data-last-light-pending></small></div></article></div></div>';
    root.appendChild(section);
    updateCopy(section);
  }

  function init() {
    window.setTimeout(inject, 120);
  }

  document.addEventListener("aventura:language", function () {
    window.setTimeout(function () {
      updateCopy(document.querySelector(".prelaunch-last-light-section"));
    }, 0);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());

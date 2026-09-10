(function () {
  "use strict";

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

  function initialize() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) return;

    syncBoutiqueLastLight();
    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(syncBoutiqueLastLight, 0);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());

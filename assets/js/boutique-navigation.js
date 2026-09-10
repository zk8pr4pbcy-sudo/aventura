(function () {
  "use strict";

  function setupBoutiqueResultFocus() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) return;

    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(function () {
          var target = Array.from(boutique.querySelectorAll("[data-boutique-section]")).find(function (section) {
            return !section.hidden;
          });
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 20);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBoutiqueResultFocus, { once: true });
  } else {
    setupBoutiqueResultFocus();
  }
}());

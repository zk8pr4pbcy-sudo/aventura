(function () {
  "use strict";

  function applyPartnerCopyFix() {
    if (window.AVENTURA_I18N && window.AVENTURA_I18N.es) {
      window.AVENTURA_I18N.es["partners.formSideTitle"] = "Cuéntanos en qué destacas.";
    }

    if (document.documentElement.lang === "es") {
      document.querySelectorAll('[data-i18n="partners.formSideTitle"]').forEach(function (element) {
        element.textContent = "Cuéntanos en qué destacas.";
      });
    }
  }

  applyPartnerCopyFix();
  document.addEventListener("aventura:language", applyPartnerCopyFix);
}());

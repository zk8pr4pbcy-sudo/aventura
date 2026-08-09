(function () {
  "use strict";

  var copy = {
    en: {
      "experiences.historicItem3": "Arabic coffee, dates and selected heritage stops",
      "experiences.readyHistoricText": "All walking formats include Arabic coffee, dates and a licensed guide. Any additional paid entries are confirmed separately.",
      "experiences.stbStep3Text": "A licensed guided walk with Arabic coffee, dates and selected heritage stops."
    },
    ar: {
      "experiences.historicItem3": "القهوة العربية والتمر ومحطات تراثية مختارة",
      "experiences.readyHistoricText": "تشمل جميع جولات المشي القهوة العربية والتمر ومرشدًا سياحيًا مرخصًا، وتُؤكد أي رسوم دخول إضافية بشكل منفصل.",
      "experiences.stbStep3Text": "جولة مع مرشد سياحي مرخص تشمل القهوة العربية والتمر ومحطات تراثية مختارة."
    },
    es: {
      "experiences.historicItem3": "Café árabe, dátiles y paradas patrimoniales seleccionadas",
      "experiences.readyHistoricText": "Todos los recorridos a pie incluyen café árabe, dátiles y un guía autorizado. Las entradas adicionales de pago se confirman por separado.",
      "experiences.stbStep3Text": "Paseo con guía autorizado, café árabe, dátiles y paradas patrimoniales seleccionadas."
    }
  };

  Object.keys(copy).forEach(function (language) {
    if (!window.AVENTURA_I18N || !window.AVENTURA_I18N[language]) return;
    Object.keys(copy[language]).forEach(function (key) {
      window.AVENTURA_I18N[language][key] = copy[language][key];
    });
  });

  function setupBoutiqueResultFocus() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) return;

    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(function () {
          var target = Array.from(boutique.querySelectorAll("[data-boutique-section]")).find(function (section) {
            return !section.hidden;
          });
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
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

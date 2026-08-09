(function () {
  "use strict";

  var copy = {
    en: {
      "experiences.historicItem3": "Arabic coffee, dates and selected heritage stops",
      "experiences.readyHistoricText": "All walking formats include Arabic coffee, dates and a licensed guide. Any additional paid entries are confirmed separately.",
      "experiences.stbStep3Text": "A licensed guided walk with Arabic coffee, dates and selected heritage stops.",
      "world.historic.text": "Before the walk begins, your guide reads your interests and adjusts the pace, turning each alley into a personal way into Historic Jeddah.",
      "world.historic.note": "We do not rush the story. We leave room to notice the Roshan, stone, sounds and small details.",
      "world.historic.step1Title": "Meet your guide",
      "world.historic.step1Text": "Your guide is more than a voice telling stories; they are a living memory that knows every doorway by name and every alley by its story.",
      "world.historic.step2Title": "Read the Roshan",
      "world.historic.step2Text": "The Roshan is not understood from the street alone. Its shadows shift with the hours, and its carving holds a story left untold.",
      "world.historic.step3Text": "The walk ends where time—not the schedule—decides: a cup of Arabic coffee, a date, and enough quiet to hear the city."
    },
    ar: {
      "experiences.historicItem3": "القهوة العربية والتمر ومحطات تراثية مختارة",
      "experiences.readyHistoricText": "تشمل جميع جولات المشي القهوة العربية والتمر ومرشدًا سياحيًا مرخصًا، وتُؤكد أي رسوم دخول إضافية بشكل منفصل.",
      "experiences.stbStep3Text": "جولة مع مرشد سياحي مرخص تشمل القهوة العربية والتمر ومحطات تراثية مختارة.",
      "world.historic.text": "قبل أن تبدأ الجولة، يقرأ مرشدك اهتماماتك ويطوّع الإيقاع، ليتحوّل الزقاق إلى مدخل شخصي لجدة التاريخية.",
      "world.historic.note": "لا نستعجل الحكاية. نترك مساحة لملاحظة الروشان والحجر والأصوات والتفاصيل الصغيرة.",
      "world.historic.step1Title": "تعرّف إلى مرشدك",
      "world.historic.step1Text": "مرشدك ليس صوتًا يروي فقط، بل ذاكرة تعرف كل باب باسمه، وكل زقاق بحكايته.",
      "world.historic.step2Title": "اقرأ الروشان",
      "world.historic.step2Text": "الروشان لا يُرى من الشارع وحده. ظلاله تتبدّل مع الوقت، ونقشه يُخفي حكاية لا تُروى.",
      "world.historic.step3Text": "تختم الجولة حيث يشاء الوقت لا الجدول: فنجان قهوة، وتمرة، وصمت يكفي لسماع المدينة."
    },
    es: {
      "experiences.historicItem3": "Café árabe, dátiles y paradas patrimoniales seleccionadas",
      "experiences.readyHistoricText": "Todos los recorridos a pie incluyen café árabe, dátiles y un guía autorizado. Las entradas adicionales de pago se confirman por separado.",
      "experiences.stbStep3Text": "Paseo con guía autorizado, café árabe, dátiles y paradas patrimoniales seleccionadas.",
      "world.historic.text": "Antes de empezar, tu guía interpreta tus intereses y adapta el ritmo, haciendo de cada callejón una entrada personal a la Yeda Histórica.",
      "world.historic.note": "No apresuramos la historia. Dejamos espacio para observar el roshan, la piedra, los sonidos y los pequeños detalles.",
      "world.historic.step1Title": "Conoce a tu guía",
      "world.historic.step1Text": "Tu guía no es solo una voz que cuenta historias; es una memoria viva que conoce cada puerta por su nombre y cada callejón por su historia.",
      "world.historic.step2Title": "Lee el roshan",
      "world.historic.step2Text": "El roshan no se comprende solo desde la calle. Sus sombras cambian con las horas y sus tallas guardan una historia que queda sin contar.",
      "world.historic.step3Text": "El recorrido termina donde lo decide el tiempo, no el horario: una taza de café árabe, un dátil y el silencio suficiente para escuchar la ciudad."
    }
  };

  Object.keys(copy).forEach(function (language) {
    if (!window.AVENTURA_I18N || !window.AVENTURA_I18N[language]) return;
    Object.keys(copy[language]).forEach(function (key) {
      window.AVENTURA_I18N[language][key] = copy[language][key];
    });
  });

  function currentLanguage() {
    var language = document.documentElement.lang || "ar";
    return window.AVENTURA_I18N && window.AVENTURA_I18N[language] ? language : "en";
  }

  function translated(key, fallback) {
    var language = currentLanguage();
    var dictionary = window.AVENTURA_I18N && window.AVENTURA_I18N[language];
    return dictionary && dictionary[key] ? dictionary[key] : fallback;
  }

  function addVisualAuditStyles() {
    if (document.getElementById("aventura-prelaunch-visual-fixes")) return;
    var style = document.createElement("style");
    style.id = "aventura-prelaunch-visual-fixes";
    style.textContent = [
      ".detail-product-grid--fragrance-only>.detail-perfume-product:only-child{grid-column:1/-1;width:min(100%,420px);justify-self:center}",
      ".prelaunch-last-light-card{position:relative}",
      ".prelaunch-last-light-card small{display:block;margin-top:12px;color:rgba(255,255,255,.62);font-size:.76rem;line-height:1.55}",
      ".prelaunch-last-light-section .detail-product-grid{grid-template-columns:1fr;width:min(100%,420px);margin-inline:auto}",
      ".prelaunch-last-light-section .detail-perfume-product{width:100%}"
    ].join("");
    document.head.appendChild(style);
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

  function injectDesertLastLight() {
    if (!document.body.classList.contains("world-desert")) return;
    var root = document.querySelector("[data-experience-detail=\"desert\"]");
    if (!root || root.querySelector(".prelaunch-last-light-section")) return;

    var section = document.createElement("section");
    section.className = "section section-muted prelaunch-last-light-section";
    section.innerHTML = '<div class="container"><div class="section-heading"><div><span class="eyebrow">AVENTURA SCENT LAB</span><h2 data-last-light-heading></h2></div><p data-last-light-description></p></div><div class="detail-product-grid"></div></div>';
    var card = createPendingLastLightCard("catalog-product-card detail-perfume-product perfume-card-pending");
    section.querySelector(".detail-product-grid").appendChild(card);
    root.appendChild(section);

    section.querySelector("[data-last-light-heading]").textContent = translated("collection.p3Title", "Last Light");
    section.querySelector("[data-last-light-description]").textContent = translated("collection.p3Text", "Dry woods, sun-warmed sand, vetiver and a mineral accord.");
    refreshLastLightCopy(section);
  }

  function refreshInjectedCopy() {
    refreshLastLightCopy(document);
    var desertSection = document.querySelector(".prelaunch-last-light-section");
    if (desertSection) {
      var heading = desertSection.querySelector("[data-last-light-heading]");
      var description = desertSection.querySelector("[data-last-light-description]");
      if (heading) heading.textContent = translated("collection.p3Title", "Last Light");
      if (description) description.textContent = translated("collection.p3Text", "Dry woods, sun-warmed sand, vetiver and a mineral accord.");
    }
  }

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

  function initializeRecovery() {
    addVisualAuditStyles();
    setupBoutiqueResultFocus();
    window.setTimeout(function () {
      injectBoutiqueLastLight();
      injectDesertLastLight();
    }, 80);
  }

  document.addEventListener("aventura:language", function () {
    window.setTimeout(refreshInjectedCopy, 0);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRecovery, { once: true });
  } else {
    initializeRecovery();
  }
}());

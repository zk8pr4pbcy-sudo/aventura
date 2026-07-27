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

  function language() {
    return document.documentElement.lang || "en";
  }

  function copy(key) {
    var content = {
      en: {
        nav: "Concierge",
        eyebrow: "Aventura Concierge",
        title: "Personal services arranged around the guest.",
        text: "From a tailor visiting the hotel to made-to-measure abaya coordination, flowers and considered Saudi gifts—each request is handled privately and confirmed before delivery.",
        button: "Explore concierge services"
      },
      ar: {
        nav: "الكونسيرج",
        eyebrow: "كونسيرج أفنتورا",
        title: "خدمات شخصية تُنسق حول الضيف.",
        text: "من زيارة الخياط للفندق إلى تنسيق عباية حسب المقاسات والورد والهدايا السعودية المختارة، تُدار كل خدمة بخصوصية ويُؤكد تنفيذها قبل التسليم.",
        button: "استكشف خدمات الكونسيرج"
      },
      es: {
        nav: "Conserjería",
        eyebrow: "Aventura Concierge",
        title: "Servicios personales coordinados alrededor del huésped.",
        text: "Desde la visita del sastre al hotel hasta la coordinación de una abaya a medida, flores y regalos saudíes seleccionados; cada solicitud se gestiona de forma privada y se confirma antes de la entrega.",
        button: "Explorar servicios de conserjería"
      }
    };
    var selected = content[language()] || content.en;
    return selected[key] || "";
  }

  function addConciergeNavigation() {
    var nav = document.getElementById("primaryNav");
    if (!nav) {
      return false;
    }
    var link = nav.querySelector('[data-nav="concierge"]');
    if (!link) {
      link = document.createElement("a");
      link.className = "nav-link";
      link.setAttribute("data-nav", "concierge");
      link.href = "concierge.html";
      var collection = nav.querySelector('[data-nav="collection"]');
      nav.insertBefore(link, collection || null);
    }
    link.textContent = copy("nav");
    if (document.body && document.body.getAttribute("data-page") === "concierge") {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
    return true;
  }

  function reorderHomeExperiences() {
    if (!document.body || document.body.getAttribute("data-page") !== "home") {
      return;
    }
    var grid = document.querySelector(".experience-grid");
    if (!grid || grid.getAttribute("data-aventura-ordered") === "true") {
      return;
    }
    var order = [
      "experience-historic-jeddah.html",
      "experience-sea.html",
      "experience-desert.html",
      "experience-taif.html",
      "experience-jeddah-day.html"
    ];
    order.forEach(function (href, index) {
      var anchor = grid.querySelector('a[href="' + href + '"]');
      var card = anchor && anchor.closest("article");
      if (card) {
        grid.appendChild(card);
        if (index === 0) {
          card.classList.add("experience-card-featured");
          card.setAttribute("data-primary-experience", "historic-jeddah");
        }
      }
    });
    grid.setAttribute("data-aventura-ordered", "true");
  }

  function addHomeConciergeFeature() {
    if (!document.body || document.body.getAttribute("data-page") !== "home" || document.getElementById("aventura-concierge-home")) {
      return;
    }
    var boutiqueLink = document.querySelector('a[href="collection.html"]');
    var boutiqueSection = boutiqueLink && boutiqueLink.closest("section");
    if (!boutiqueSection || !boutiqueSection.parentNode) {
      return;
    }
    var section = document.createElement("section");
    section.className = "section section-muted";
    section.id = "aventura-concierge-home";
    section.innerHTML = [
      '<div class="container feature-split" data-reveal>',
      '  <div class="feature-media"><img src="assets/images/collection.webp" width="1200" height="675" loading="lazy" alt=""></div>',
      '  <div class="feature-copy">',
      '    <span class="eyebrow" data-concierge-copy="eyebrow"></span>',
      '    <h2 data-concierge-copy="title"></h2>',
      '    <p class="lead" data-concierge-copy="text"></p>',
      '    <a class="btn btn-dark" href="concierge.html" data-concierge-copy="button"></a>',
      '  </div>',
      '</div>'
    ].join("");
    boutiqueSection.parentNode.insertBefore(section, boutiqueSection);
    updateConciergeCopy();
  }

  function updateConciergeCopy() {
    document.querySelectorAll("[data-concierge-copy]").forEach(function (element) {
      element.textContent = copy(element.getAttribute("data-concierge-copy"));
    });
    addConciergeNavigation();
  }

  function enhanceSite() {
    addConciergeNavigation();
    reorderHomeExperiences();
    addHomeConciergeFeature();
    updateConciergeCopy();
  }

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
    window.setTimeout(updateConciergeCopy, 0);
  });

  function pageView() {
    track("page_view", {
      page: document.body ? document.body.getAttribute("data-page") : "unknown",
      language: document.documentElement.lang
    });
    enhanceSite();
    window.setTimeout(enhanceSite, 50);
    window.setTimeout(enhanceSite, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pageView, { once: true });
  } else {
    pageView();
  }
}());

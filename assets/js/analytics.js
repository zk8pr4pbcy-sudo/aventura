(function () {
  "use strict";

  function applyLaunchTheme() {
    var themeLink = document.getElementById("aventura-light-theme");
    if (!themeLink) {
      themeLink = document.createElement("link");
      themeLink.id = "aventura-light-theme";
      themeLink.rel = "stylesheet";
      themeLink.href = "assets/css/light-theme.css?v=20260728";
      document.head.appendChild(themeLink);
    }

    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", "#FFF9EF");
    }
  }

  var REQUEST_TYPES = {
    en: [
      ["", "Choose one"],
      ["historic-jeddah", "Historic Jeddah experience"],
      ["sea", "Red Sea experience"],
      ["desert", "Desert experience"],
      ["taif", "Taif journey"],
      ["jeddah-day", "A complete Jeddah day"],
      ["corporate", "Corporate program"],
      ["private-event", "Private event or occasion"],
      ["vip-hosting", "VIP or delegation hosting"],
      ["custom-experience", "Design a custom experience"],
      ["partnership", "Partnership or collaboration"],
      ["general-inquiry", "General inquiry"]
    ],
    ar: [
      ["", "اختر النوع"],
      ["historic-jeddah", "جولة جدة التاريخية"],
      ["sea", "تجربة بحرية"],
      ["desert", "تجربة صحراوية"],
      ["taif", "رحلة إلى الطائف"],
      ["jeddah-day", "يوم متكامل في جدة"],
      ["corporate", "برنامج شركات"],
      ["private-event", "فعالية أو مناسبة خاصة"],
      ["vip-hosting", "استضافة كبار الشخصيات أو الوفود"],
      ["custom-experience", "تصميم تجربة خاصة"],
      ["partnership", "تعاون أو شراكة"],
      ["general-inquiry", "استفسار عام"]
    ],
    es: [
      ["", "Elige una opción"],
      ["historic-jeddah", "Experiencia en Yeda Histórica"],
      ["sea", "Experiencia en el Mar Rojo"],
      ["desert", "Experiencia en el desierto"],
      ["taif", "Viaje a Taif"],
      ["jeddah-day", "Un día completo en Yeda"],
      ["corporate", "Programa corporativo"],
      ["private-event", "Evento u ocasión privada"],
      ["vip-hosting", "Atención VIP o delegaciones"],
      ["custom-experience", "Diseñar una experiencia a medida"],
      ["partnership", "Colaboración o alianza"],
      ["general-inquiry", "Consulta general"]
    ]
  };

  function updateRequestTypeOptions(language) {
    var select = document.getElementById("type");
    if (!select || !document.body || document.body.getAttribute("data-page") !== "contact") {
      return;
    }

    var currentValue = select.value;
    var options = REQUEST_TYPES[language] || REQUEST_TYPES.en;
    select.innerHTML = "";

    options.forEach(function (item, index) {
      var option = document.createElement("option");
      option.value = item[0];
      option.textContent = item[1];
      if (index === 0) {
        option.disabled = true;
      }
      select.appendChild(option);
    });

    if (options.some(function (item) { return item[0] === currentValue; })) {
      select.value = currentValue;
    } else {
      select.value = "";
    }
  }

  function initializeRequestTypes() {
    updateRequestTypeOptions(document.documentElement.lang || "en");
    document.addEventListener("aventura:language", function (event) {
      updateRequestTypeOptions((event.detail && event.detail.language) || document.documentElement.lang || "en");
    });
  }

  applyLaunchTheme();

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
    initializeRequestTypes();
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

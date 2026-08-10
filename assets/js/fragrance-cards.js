(function () {
  "use strict";

  var ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com";
  var root = document.querySelector("[data-experience-detail]");
  if (!root) return;

  var experienceId = root.getAttribute("data-experience-id") || "";
  var cards = {
    sea: [
      { id: "sea-experience", name: "Sea Experience", image: "assets/images/fragrance-cards/sea-experience.webp" }
    ],
    historic: [
      { id: "roshan", name: "Roshan", image: "assets/images/fragrance-cards/roshan.webp" }
    ],
    desert: [
      { id: "last-light", name: "Last Light", image: "assets/images/fragrance-cards/last-light.webp" }
    ],
    taif: [
      { id: "taif-experience", name: "Taif Experience", image: "assets/images/fragrance-cards/taif-experience.webp" }
    ],
    jeddah: [
      { id: "after-midnight-noir", name: "After Midnight Noir", image: "assets/images/fragrance-cards/after-midnight-noir.webp" },
      { id: "after-midnight-velvet", name: "After Midnight Velvet", image: "assets/images/fragrance-cards/after-midnight-velvet.webp" }
    ]
  };

  if (!cards[experienceId]) return;

  var copy = {
    ar: {
      eyebrow: "مجموعة أفنتورا العطرية",
      title: "عطور تُولد من التجربة",
      text: "لكل تجربة في أفنتورا أثرها الخاص. نعمل على ترجمة هذا الأثر إلى عطور تحمل روح المكان وذاكرته، وتمنح الضيف امتدادًا للتجربة بعد انتهائها. المجموعة قيد التطوير وستتوفر قريبًا.",
      soon: "قريبًا",
      interest: "أبلغني عند التوفر",
      dialogTitle: "سجّل اهتمامك بالعطر",
      dialogText: "اترك بيانات التواصل، وسنتواصل معك عند توفر العطر.",
      name: "الاسم",
      contact: "البريد الإلكتروني أو رقم الجوال",
      send: "تسجيل الاهتمام",
      sending: "جارٍ الإرسال…",
      success: "تم تسجيل اهتمامك. سنتواصل معك عند توفر العطر.",
      error: "تعذر الإرسال الآن. حاول مرة أخرى بعد قليل.",
      close: "إغلاق"
    },
    en: {
      eyebrow: "Aventura Fragrance Collection",
      title: "Fragrances born from the experience",
      text: "Every Aventura experience leaves its own imprint. We are translating that feeling into fragrances that carry the spirit and memory of place, extending the experience beyond the day itself. The collection is in development and will be available soon.",
      soon: "Coming soon",
      interest: "Notify me when available",
      dialogTitle: "Register your interest",
      dialogText: "Leave your contact details and we’ll reach out when this fragrance becomes available.",
      name: "Name",
      contact: "Email or mobile number",
      send: "Register interest",
      sending: "Sending…",
      success: "Your interest has been registered. We’ll contact you when the fragrance becomes available.",
      error: "We couldn’t send this right now. Please try again shortly.",
      close: "Close"
    },
    es: {
      eyebrow: "Colección de fragancias Aventura",
      title: "Fragancias nacidas de la experiencia",
      text: "Cada experiencia de Aventura deja una huella propia. Estamos transformando esa sensación en fragancias que conservan el espíritu y la memoria del lugar, prolongando la experiencia más allá del momento vivido. La colección está en desarrollo y estará disponible próximamente.",
      soon: "Próximamente",
      interest: "Avísame cuando esté disponible",
      dialogTitle: "Registra tu interés",
      dialogText: "Déjanos tus datos de contacto y te avisaremos cuando esta fragancia esté disponible.",
      name: "Nombre",
      contact: "Correo electrónico o móvil",
      send: "Registrar interés",
      sending: "Enviando…",
      success: "Hemos registrado tu interés. Te contactaremos cuando la fragancia esté disponible.",
      error: "No hemos podido enviarlo ahora. Inténtalo de nuevo en unos minutos.",
      close: "Cerrar"
    }
  };

  function language() {
    var lang = (document.documentElement.lang || "ar").toLowerCase();
    return copy[lang] ? lang : "en";
  }

  function t(key) {
    return copy[language()][key] || copy.en[key] || key;
  }

  function cardMarkup(card) {
    return [
      '<article class="aventura-fragrance-card" data-fragrance-id="' + card.id + '">',
      '  <div class="aventura-fragrance-card-media"><img src="' + card.image + '" alt="' + card.name + '" loading="eager" decoding="async"></div>',
      '  <div class="aventura-fragrance-card-actions">',
      '    <span class="status coming" data-fragrance-copy="soon">' + t("soon") + '</span>',
      '    <button class="btn btn-outline-dark aventura-fragrance-interest" type="button" data-fragrance-interest="' + card.id + '" data-fragrance-name="' + card.name + '">' + t("interest") + '</button>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function sectionMarkup() {
    return [
      '<section class="section aventura-fragrance-section" id="aventura-fragrances">',
      '  <div class="container">',
      '    <div class="section-heading aventura-fragrance-heading">',
      '      <div><span class="eyebrow" data-fragrance-copy="eyebrow">' + t("eyebrow") + '</span><h2 data-fragrance-copy="title">' + t("title") + '</h2></div>',
      '      <p data-fragrance-copy="text">' + t("text") + '</p>',
      '    </div>',
      '    <div class="aventura-fragrance-grid">' + cards[experienceId].map(cardMarkup).join("") + '</div>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function dialogMarkup() {
    return [
      '<dialog class="aventura-fragrance-dialog" data-fragrance-dialog>',
      '  <form class="aventura-fragrance-interest-form" data-fragrance-form>',
      '    <div class="aventura-fragrance-dialog-head">',
      '      <div><span class="eyebrow" data-fragrance-dialog-name></span><h2 data-fragrance-copy="dialogTitle">' + t("dialogTitle") + '</h2></div>',
      '      <button class="dialog-close" type="button" data-fragrance-close aria-label="' + t("close") + '">×</button>',
      '    </div>',
      '    <p data-fragrance-copy="dialogText">' + t("dialogText") + '</p>',
      '    <label class="field"><span data-fragrance-copy="name">' + t("name") + '</span><input name="name" autocomplete="name" required></label>',
      '    <label class="field"><span data-fragrance-copy="contact">' + t("contact") + '</span><input name="contact" autocomplete="email" required></label>',
      '    <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="aventura-fragrance-honey" aria-hidden="true">',
      '    <input type="hidden" name="fragrance" data-fragrance-field>',
      '    <div class="aventura-fragrance-form-actions"><button class="btn" type="submit" data-fragrance-submit>' + t("send") + '</button></div>',
      '    <p class="aventura-fragrance-form-status" data-fragrance-status aria-live="polite"></p>',
      '  </form>',
      '</dialog>'
    ].join("");
  }

  function removeLegacyFragranceUi() {
    var legacy = root.querySelector("#experience-products");
    if (legacy) legacy.remove();
    root.querySelectorAll(".perfume-story-dialog").forEach(function (node) { node.remove(); });
    document.querySelectorAll(".prelaunch-last-light-section").forEach(function (node) { node.remove(); });
  }

  function refreshCopy() {
    document.querySelectorAll("[data-fragrance-copy]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-fragrance-copy"));
    });
    document.querySelectorAll("[data-fragrance-close]").forEach(function (node) {
      node.setAttribute("aria-label", t("close"));
    });
  }

  function trackInterest(card) {
    var params = {
      product_id: card.id,
      product_name: card.name,
      page_path: location.pathname,
      page_language: document.documentElement.lang || ""
    };
    if (typeof window.gtag === "function") window.gtag("event", "product_interest", params);
    if (typeof window.AVENTURA_TRACK === "function") window.AVENTURA_TRACK("product_interest", { productId: card.id, source: "fragrance_card" });
  }

  function initialize() {
    removeLegacyFragranceUi();
    var oldSection = document.querySelector(".aventura-fragrance-section");
    if (oldSection) oldSection.remove();
    var oldDialog = document.querySelector("[data-fragrance-dialog]");
    if (oldDialog) oldDialog.remove();

    root.insertAdjacentHTML("beforeend", sectionMarkup() + dialogMarkup());

    var dialog = document.querySelector("[data-fragrance-dialog]");
    var form = dialog.querySelector("[data-fragrance-form]");
    var status = dialog.querySelector("[data-fragrance-status]");
    var fragranceField = dialog.querySelector("[data-fragrance-field]");
    var dialogName = dialog.querySelector("[data-fragrance-dialog-name]");
    var submit = dialog.querySelector("[data-fragrance-submit]");
    var activeCard = null;

    document.querySelectorAll("[data-fragrance-interest]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeCard = cards[experienceId].find(function (card) { return card.id === button.getAttribute("data-fragrance-interest"); });
        if (!activeCard) return;
        fragranceField.value = activeCard.name;
        dialogName.textContent = activeCard.name;
        status.textContent = "";
        form.reset();
        fragranceField.value = activeCard.name;
        if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
      });
    });

    dialog.querySelector("[data-fragrance-close]").addEventListener("click", function () {
      if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!activeCard) return;
      var data = new FormData(form);
      data.set("fragrance", activeCard.name);
      data.set("fragrance_id", activeCard.id);
      data.set("page", location.href);
      data.set("language", document.documentElement.lang || "");
      data.set("_subject", "اهتمام بعطر — " + activeCard.name);
      data.set("_captcha", "false");
      submit.disabled = true;
      submit.textContent = t("sending");
      status.textContent = "";

      fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (response) {
          if (!response.ok) throw new Error("interest-submit-failed");
          return response.json().catch(function () { return {}; });
        })
        .then(function (payload) {
          if (payload && payload.success === false) throw new Error("interest-submit-rejected");
          status.textContent = t("success");
          trackInterest(activeCard);
          form.reset();
          fragranceField.value = activeCard.name;
        })
        .catch(function () { status.textContent = t("error"); })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = t("send");
        });
    });

    document.addEventListener("aventura:language", refreshCopy);
    refreshCopy();
  }

  function ready() {
    window.setTimeout(initialize, 140);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
}());

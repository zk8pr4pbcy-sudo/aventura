(function () {
  "use strict";

  var COPY = {
    ar: {
      consent: "أوافق على معالجة بياناتي لغرض مراجعة طلبي والتواصل معي وفق سياسة الخصوصية.",
      privacy: "سياسة الخصوصية",
      error: "يجب الموافقة على معالجة البيانات وفق سياسة الخصوصية قبل إرسال الطلب."
    },
    en: {
      consent: "I agree that Aventura may process my data to review my request and contact me under the Privacy Policy.",
      privacy: "Privacy Policy",
      error: "Please agree to the data processing terms in the Privacy Policy before sending your request."
    },
    es: {
      consent: "Acepto que Aventura trate mis datos para revisar mi solicitud y ponerse en contacto conmigo conforme a la Política de privacidad.",
      privacy: "Política de privacidad",
      error: "Debes aceptar el tratamiento de datos conforme a la Política de privacidad antes de enviar la solicitud."
    }
  };

  function language() {
    var lang = String(document.documentElement.lang || "ar").toLowerCase();
    return COPY[lang] ? lang : "ar";
  }

  function addStyles() {
    if (document.getElementById("aventura-contact-flow-fix-styles")) return;
    var style = document.createElement("style");
    style.id = "aventura-contact-flow-fix-styles";
    style.textContent = [
      'body[data-page="contact"] .contact-layout{grid-template-columns:minmax(0,1fr)!important;}',
      'body[data-page="contact"] .form-card{order:1!important;width:100%!important;}',
      'body[data-page="contact"] .contact-panel{order:2!important;width:100%!important;margin-top:10px;}',
      'body[data-page="contact"] .aventura-request-consent{display:flex;align-items:flex-start;gap:10px;width:100%;margin-top:8px;padding:16px 18px;border:1px solid rgba(10,42,67,.14);border-radius:14px;background:rgba(255,255,255,.55);color:var(--navy-900);font-size:.92rem;line-height:1.65;}',
      'body[data-page="contact"] .aventura-request-consent input{width:18px!important;min-width:18px!important;max-width:18px!important;height:18px;margin:4px 0 0;flex:0 0 18px;accent-color:var(--navy-900);}',
      'body[data-page="contact"] .aventura-request-consent a{color:var(--navy-900);font-weight:700;text-decoration:underline;}',
      '@media(min-width:981px){body[data-page="contact"] .container.contact-layout{max-width:980px;}}'
    ].join("");
    document.head.appendChild(style);
  }

  function enforceOrder() {
    var layout = document.querySelector("body[data-page=\"contact\"] .contact-layout");
    var form = layout && layout.querySelector("[data-contact-form]");
    var panel = layout && layout.querySelector(".contact-panel");
    if (!layout || !form || !panel) return;
    if (form.nextElementSibling !== panel) {
      layout.insertBefore(form, panel);
    }
  }

  function ensureConsent() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var stepThree = form.querySelector('[data-request-step="3"] [data-request-step-grid]');
    if (!stepThree) return;

    var wrapper = form.querySelector("[data-request-consent]");
    if (!wrapper) {
      wrapper = document.createElement("label");
      wrapper.className = "aventura-request-consent full";
      wrapper.setAttribute("data-request-consent", "");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "privacy_consent";
      checkbox.value = "yes";
      checkbox.required = true;
      checkbox.setAttribute("aria-required", "true");

      var text = document.createElement("span");
      text.setAttribute("data-request-consent-text", "");

      wrapper.appendChild(checkbox);
      wrapper.appendChild(text);
    }

    var actions = stepThree.querySelector(".request-step-actions");
    if (actions) stepThree.insertBefore(wrapper, actions);
    else stepThree.appendChild(wrapper);

    updateConsentCopy();
  }

  function updateConsentCopy() {
    var wrapper = document.querySelector("[data-request-consent]");
    if (!wrapper) return;
    var text = wrapper.querySelector("[data-request-consent-text]");
    if (!text) return;

    var current = COPY[language()];
    text.textContent = "";

    var labelText = current.consent;
    var policyText = current.privacy;
    var index = labelText.toLowerCase().indexOf(policyText.toLowerCase());

    if (index === -1) {
      text.appendChild(document.createTextNode(labelText + " "));
      var fallbackLink = document.createElement("a");
      fallbackLink.href = "privacy.html";
      fallbackLink.textContent = policyText;
      text.appendChild(fallbackLink);
      return;
    }

    text.appendChild(document.createTextNode(labelText.slice(0, index)));
    var link = document.createElement("a");
    link.href = "privacy.html";
    link.textContent = labelText.slice(index, index + policyText.length);
    text.appendChild(link);
    text.appendChild(document.createTextNode(labelText.slice(index + policyText.length)));
  }

  function enforceConsentOnSubmit() {
    var form = document.querySelector("[data-contact-form]");
    if (!form || form.dataset.consentGuardBound === "true") return;
    form.dataset.consentGuardBound = "true";

    form.addEventListener("submit", function (event) {
      var consent = form.querySelector('[name="privacy_consent"]');
      if (consent && consent.checked) {
        var stamp = form.querySelector('[name="privacy_consent_at"]');
        if (!stamp) {
          stamp = document.createElement("input");
          stamp.type = "hidden";
          stamp.name = "privacy_consent_at";
          form.appendChild(stamp);
        }
        stamp.value = new Date().toISOString();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      var status = form.querySelector("[data-form-status]");
      if (status) {
        status.textContent = COPY[language()].error;
        status.classList.remove("is-success");
      }
      if (consent) {
        consent.focus();
        consent.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, true);
  }

  function apply() {
    addStyles();
    enforceOrder();
    ensureConsent();
    enforceConsentOnSubmit();
  }

  document.addEventListener("aventura:contact-wizard-ready", apply);
  document.addEventListener("aventura:language", function () {
    apply();
    updateConsentCopy();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      apply();
      window.setTimeout(apply, 0);
    }, { once: true });
  } else {
    apply();
    window.setTimeout(apply, 0);
  }
})();

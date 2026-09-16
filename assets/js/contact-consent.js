(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var consent = form.querySelector('[name="privacy_consent"]');
  if (!consent) return;

  function language() {
    var lang = String(document.documentElement.lang || "ar").toLowerCase();
    return ["ar", "en", "es"].indexOf(lang) !== -1 ? lang : "ar";
  }

  function errorMessage() {
    var wrapper = consent.closest("[data-request-consent]");
    if (!wrapper) return "";
    return wrapper.getAttribute("data-consent-error-" + language()) || wrapper.getAttribute("data-consent-error-ar") || "";
  }

  function setConsentTimestamp() {
    var stamp = form.querySelector('[name="privacy_consent_at"]');
    if (stamp) {
      stamp.value = new Date().toISOString();
    }
  }

  form.addEventListener("submit", function (event) {
    if (consent.checked) {
      setConsentTimestamp();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    var status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = errorMessage();
      status.classList.remove("is-success");
    }

    consent.focus();
    consent.scrollIntoView({ behavior: "smooth", block: "center" });
  }, true);
})();

(function loadSponsoredAgentPrefill() {
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var source = String(params.get("avsrc") || "").toLowerCase();
  if (["chatgpt", "chatgpt-ad", "chatgpt-sponsored-agent"].indexOf(source) === -1) return;

  var script = document.createElement("script");
  script.src = "assets/js/sponsored-agent-prefill.js?v=20260917";
  script.defer = true;
  document.head.appendChild(script);
})();

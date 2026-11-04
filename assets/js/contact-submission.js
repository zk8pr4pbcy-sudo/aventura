(function () {
  "use strict";

  function decodeContactValue(values) {
    return values.map(function (value) { return String.fromCharCode(value - 7); }).join("");
  }

  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + decodeContactValue([106, 118, 117, 123, 104, 106, 123, 71, 104, 125, 108, 117, 123, 124, 121, 104, 114, 122, 104, 53, 106, 118, 116]);
  var WHATSAPP_NUMBER = decodeContactValue([64, 61, 61, 60, 60, 60, 63, 63, 59, 63, 60, 59]);
  var EMAIL_TIMEOUT_MS = 25000;

  function deliveryError(code, status) {
    var error = new Error(code);
    error.code = code;
    error.status = status || 0;
    return error;
  }

  function sendEmail(payload) {
    if (!window.fetch) {
      return Promise.reject(deliveryError("EMAIL_NETWORK"));
    }
    var controller = window.AbortController ? new window.AbortController() : null;
    var timer;
    return new Promise(function (resolve, reject) {
      timer = window.setTimeout(function () {
        reject(deliveryError("EMAIL_TIMEOUT"));
        if (controller) controller.abort();
      }, EMAIL_TIMEOUT_MS);
      window.fetch(FORM_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
        signal: controller ? controller.signal : undefined
      }).then(function (response) {
        if (response.status >= 500 || response.status === 429) {
          throw deliveryError("EMAIL_SERVICE_UNAVAILABLE", response.status);
        }
        return response.json().catch(function () {
          throw deliveryError("EMAIL_INVALID_RESPONSE", response.status);
        }).then(function (body) {
          if (!body || typeof body !== "object") {
            throw deliveryError("EMAIL_INVALID_RESPONSE", response.status);
          }
          if (!response.ok || body.success === false || body.success === "false") {
            throw deliveryError("EMAIL_REJECTED", response.status);
          }
          if (body.success !== true && body.success !== "true") {
            throw deliveryError("EMAIL_INVALID_RESPONSE", response.status);
          }
          return body;
        });
      }).then(resolve, function (error) {
        reject(error.code ? error : deliveryError("EMAIL_NETWORK"));
      });
    }).finally(function () {
      window.clearTimeout(timer);
    });
  }

  function buildWhatsAppUrl(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message || "");
  }

  window.AVENTURA_CONTACT_SUBMISSION = Object.freeze({
    formSubmitEndpoint: FORM_SUBMIT_ENDPOINT,
    whatsappNumber: WHATSAPP_NUMBER,
    sendEmail: sendEmail,
    buildWhatsAppUrl: buildWhatsAppUrl
  });
}());

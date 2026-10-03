(function () {
  "use strict";

  function decodeContactValue(values) {
    return values.map(function (value) { return String.fromCharCode(value - 7); }).join("");
  }

  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + decodeContactValue([106, 118, 117, 123, 104, 106, 123, 71, 104, 125, 108, 117, 123, 124, 121, 104, 114, 122, 104, 53, 106, 118, 116]);
  var WHATSAPP_NUMBER = decodeContactValue([64, 61, 61, 60, 60, 60, 63, 63, 59, 63, 60, 59]);

  function sendEmail(payload) {
    if (!window.fetch) {
      return Promise.reject(new Error("Fetch is unavailable"));
    }
    return window.fetch(FORM_SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok || body.success === false || body.success === "false") {
          throw new Error("FormSubmit rejected the request");
        }
        return body;
      });
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

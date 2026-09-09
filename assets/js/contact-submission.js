(function () {
  "use strict";

  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com";
  var WHATSAPP_NUMBER = "966555884854";

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

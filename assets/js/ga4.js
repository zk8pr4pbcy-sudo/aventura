(function () {
  "use strict";

  var MEASUREMENT_ID = "G-MC0GBSTCRT";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  if (!document.querySelector('script[data-aventura-ga4]')) {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
    script.setAttribute("data-aventura-ga4", "true");
    document.head.appendChild(script);
  }

  function event(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  }

  document.addEventListener("change", function (e) {
    var target = e.target;
    if (!target) return;

    if (target.id === "type" && target.value) {
      event("request_type_selected", {
        request_type: target.value,
        page_language: document.documentElement.lang || ""
      });
    }

    if (target.name === "submissionChannel" && target.value) {
      event("request_channel_selected", {
        request_channel: target.value,
        page_language: document.documentElement.lang || ""
      });
    }
  });

  document.addEventListener("click", function (e) {
    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;

    var href = String(link.getAttribute("href") || "");
    if (/wa\.me|whatsapp/i.test(href)) {
      event("whatsapp_click", {
        link_url: link.href || href,
        page_path: location.pathname,
        page_language: document.documentElement.lang || ""
      });
    }
  });

  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", function () {
      var type = contactForm.querySelector("#type");
      var channel = contactForm.querySelector('input[name="submissionChannel"]:checked');
      event("request_submit_attempt", {
        request_type: type ? type.value : "",
        request_channel: channel ? channel.value : "email",
        page_language: document.documentElement.lang || ""
      });
    });
  }
})();

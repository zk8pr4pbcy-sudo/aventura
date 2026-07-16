(function () {
  "use strict";

  var SUPPORTED_LANGUAGES = ["en", "ar", "es"];
  var DEFAULT_LANGUAGE = "en";
  var STORAGE_KEY = "aventura_language";
  var WHATSAPP_NUMBER = "966555884854";
  var currentLanguage = DEFAULT_LANGUAGE;

  function headerMarkup() {
    return [
      '<a class="skip-link" href="#main" data-i18n="common.skip">Skip to main content</a>',
      '<header class="site-header" id="siteHeader">',
      '  <div class="container nav-shell">',
      '    <a class="brand" href="index.html" aria-label="AVENTURA home">',
      '      <img class="brand-logo" src="assets/images/aventura-logo.svg" width="590" height="120" alt="">',
      '      <span class="sr-only" data-i18n="brand.tagline">Experiences · Events · Hospitality</span>',
      '    </a>',
      '    <nav class="primary-nav" id="primaryNav" aria-label="Primary navigation">',
      '      <a class="nav-link" data-nav="home" href="index.html"><span data-i18n="nav.home">Home</span></a>',
      '      <a class="nav-link" data-nav="experiences" href="experiences.html"><span data-i18n="nav.experiences">Experiences</span></a>',
      '      <a class="nav-link" data-nav="corporate" href="corporate.html"><span data-i18n="nav.corporate">Corporate</span></a>',
      '      <a class="nav-link" data-nav="events" href="events.html"><span data-i18n="nav.events">Events</span></a>',
      '      <a class="nav-link" data-nav="services" href="services.html"><span data-i18n="nav.services">Services</span></a>',
      '      <a class="nav-link" data-nav="collection" href="collection.html"><span data-i18n="nav.collection">Boutique</span></a>',
      '      <a class="nav-link" data-nav="about" href="about.html"><span data-i18n="nav.about">About</span></a>',
      '      <a class="nav-link" data-nav="partners" href="partners.html"><span data-i18n="nav.partners">Partner with us</span></a>',
      '      <a class="nav-link" data-nav="contact" href="contact.html"><span data-i18n="nav.contact">Contact</span></a>',
      '    </nav>',
      '    <div class="header-actions">',
      '      <div class="lang-switch" role="group" aria-label="Language">',
      '        <button type="button" data-language="en" aria-label="English">EN</button>',
      '        <button type="button" data-language="ar" aria-label="العربية">AR</button>',
      '        <button type="button" data-language="es" aria-label="Español">ES</button>',
      '      </div>',
      '      <a class="btn btn-sm header-plan" href="contact.html" data-i18n="common.plan">Plan your experience</a>',
      '      <button class="nav-toggle" type="button" aria-controls="primaryNav" aria-expanded="false" aria-label="Open navigation"><span></span></button>',
      '    </div>',
      '  </div>',
      '</header>'
    ].join("");
  }

  function footerMarkup() {
    return [
      '<footer class="site-footer">',
      '  <div class="container footer-main">',
      '    <div class="footer-brand">',
      '      <a class="brand" href="index.html" aria-label="AVENTURA home">',
      '        <img class="brand-logo" src="assets/images/aventura-logo.svg" width="590" height="120" alt="">',
      '        <span class="sr-only" data-i18n="brand.tagline">Experiences · Events · Hospitality</span>',
      '      </a>',
      '      <p data-i18n="footer.summary">Aventura designs private journeys, events and guest programs with thoughtful planning, trusted partners and hands-on coordination.</p>',
      '    </div>',
      '    <div class="footer-column">',
      '      <h3 data-i18n="footer.explore">Explore</h3>',
      '      <ul class="footer-links">',
      '        <li><a href="experiences.html" data-i18n="nav.experiences">Experiences</a></li>',
      '        <li><a href="corporate.html" data-i18n="nav.corporate">Corporate</a></li>',
      '        <li><a href="events.html" data-i18n="nav.events">Events</a></li>',
      '        <li><a href="services.html" data-i18n="nav.services">Services</a></li>',
      '        <li><a href="collection.html" data-i18n="nav.collection">Boutique</a></li>',
      '      </ul>',
      '    </div>',
      '    <div class="footer-column">',
      '      <h3 data-i18n="footer.company">Company</h3>',
      '      <ul class="footer-links">',
      '        <li><a href="about.html" data-i18n="nav.about">About</a></li>',
      '        <li><a href="partners.html" data-i18n="nav.partners">Partner with us</a></li>',
      '        <li><a href="gallery.html" data-i18n="nav.gallery">Gallery</a></li>',
      '        <li><a href="faq.html" data-i18n="footer.faq">Frequently asked questions</a></li>',
      '        <li><a href="privacy.html" data-i18n="footer.privacy">Privacy policy</a></li>',
      '      </ul>',
      '    </div>',
      '    <div class="footer-column footer-contact">',
      '      <h3 data-i18n="footer.contact">Contact</h3>',
      '      <ul class="footer-links">',
      '        <li><a href="https://wa.me/' + WHATSAPP_NUMBER + '" target="_blank" rel="noopener">+966 55 588 4854</a></li>',
      '        <li><a href="mailto:amassiri@aventuraksa.com">amassiri@aventuraksa.com</a></li>',
      '        <li><a href="mailto:Waseem@aventuraksa.com">Waseem@aventuraksa.com</a></li>',
      '        <li><span data-i18n="footer.location">Jeddah, Saudi Arabia</span></li>',
      '      </ul>',
      '    </div>',
      '  </div>',
      '  <div class="container footer-bottom">',
      '    <span>© <span data-current-year></span> AVENTURA. <span data-i18n="footer.rights">All rights reserved.</span></span>',
      '    <div class="footer-bottom-links">',
      '      <a href="partners.html" data-i18n="nav.partners">Partner with us</a>',
      '      <a href="privacy.html" data-i18n="footer.privacy">Privacy policy</a>',
      '      <a href="contact.html" data-i18n="nav.contact">Contact</a>',
      '    </div>',
      '  </div>',
      '</footer>',
      '<a class="whatsapp-float" href="https://wa.me/' + WHATSAPP_NUMBER + '" target="_blank" rel="noopener" data-i18n-aria="whatsapp.label" aria-label="Open WhatsApp">',
      '  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.11 17.21c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.41-2.09-1.29-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.59-1.41-.8-1.93-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.07-.7.33-.24.26-.91.89-.91 2.17 0 1.28.94 2.52 1.07 2.69.13.17 1.84 2.81 4.46 3.94.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.11-.24-.17-.5-.3M16.03 26.67h-.01a10.63 10.63 0 0 1-5.42-1.49l-.39-.23-4.03 1.06 1.08-3.93-.25-.4a10.61 10.61 0 0 1-1.63-5.66c0-5.87 4.78-10.65 10.67-10.65a10.57 10.57 0 0 1 7.54 3.13 10.57 10.57 0 0 1 3.12 7.54c0 5.87-4.79 10.64-10.68 10.64m9.07-19.7A12.73 12.73 0 0 0 16.04 3.2C8.99 3.2 3.26 8.93 3.26 15.98c0 2.25.59 4.45 1.71 6.38L3.15 29l6.8-1.78a12.79 12.79 0 0 0 6.08 1.55h.01c7.04 0 12.78-5.73 12.78-12.78 0-3.41-1.32-6.62-3.72-9.02"/></svg>',
      '</a>'
    ].join("");
  }

  function registerComponents() {
    if (!customElements.get("site-header")) {
      customElements.define("site-header", class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = headerMarkup();
        }
      });
    }

    if (!customElements.get("site-footer")) {
      customElements.define("site-footer", class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = footerMarkup();
        }
      });
    }
  }

  function readPath(object, key) {
    if (!object || !key) {
      return null;
    }
    return Object.prototype.hasOwnProperty.call(object, key) ? object[key] : null;
  }

  function translate(key, language) {
    var dictionary = window.AVENTURA_I18N || {};
    var selected = dictionary[language || currentLanguage] || {};
    var fallback = dictionary[DEFAULT_LANGUAGE] || {};
    return readPath(selected, key) || readPath(fallback, key) || key;
  }

  function getInitialLanguage() {
    var query = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED_LANGUAGES.indexOf(query) !== -1) {
      return query;
    }

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.indexOf(saved) !== -1) {
        return saved;
      }
    } catch (error) {
      /* Local storage may be disabled. */
    }

    var browserLanguage = (navigator.language || "").slice(0, 2).toLowerCase();
    return SUPPORTED_LANGUAGES.indexOf(browserLanguage) !== -1 ? browserLanguage : DEFAULT_LANGUAGE;
  }

  function applyLanguage(language, updateUrl) {
    if (SUPPORTED_LANGUAGES.indexOf(language) === -1) {
      language = DEFAULT_LANGUAGE;
    }

    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = translate(element.getAttribute("data-i18n"), language);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      element.setAttribute("placeholder", translate(element.getAttribute("data-i18n-placeholder"), language));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
      element.setAttribute("aria-label", translate(element.getAttribute("data-i18n-aria"), language));
    });

    document.querySelectorAll("[data-language]").forEach(function (button) {
      var active = button.getAttribute("data-language") === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var titleKey = document.body.getAttribute("data-title-key");
    var descriptionKey = document.body.getAttribute("data-description-key");
    if (titleKey) {
      document.title = translate(titleKey, language);
    }
    if (descriptionKey) {
      var description = document.querySelector('meta[name="description"]');
      if (description) {
        description.setAttribute("content", translate(descriptionKey, language));
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      /* Local storage may be disabled. */
    }

    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", language);
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    document.dispatchEvent(new CustomEvent("aventura:language", { detail: { language: language } }));
  }

  function setupLanguageSwitcher() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-language]");
      if (!button) {
        return;
      }
      applyLanguage(button.getAttribute("data-language"), true);
    });
  }

  function setupHeader() {
    var header = document.getElementById("siteHeader");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primaryNav");
    var page = document.body.getAttribute("data-page");
    var active = document.querySelector('[data-nav="' + page + '"]');

    if (active) {
      active.classList.add("is-active");
      active.setAttribute("aria-current", "page");
    }

    function updateHeader() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && nav) {
      function closeMenu() {
        document.body.classList.remove("nav-open");
        if (header) {
          header.classList.remove("menu-open");
        }
        toggle.setAttribute("aria-expanded", "false");
      }

      toggle.addEventListener("click", function () {
        var willOpen = !document.body.classList.contains("nav-open");
        document.body.classList.toggle("nav-open", willOpen);
        if (header) {
          header.classList.toggle("menu-open", willOpen);
        }
        toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });

      nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          closeMenu();
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeMenu();
        }
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth > 900) {
          closeMenu();
        }
      }, { passive: true });
    }
  }

  function setupBoutiqueFilters() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) {
      return;
    }

    var buttons = Array.from(boutique.querySelectorAll("[data-boutique-filter]"));
    var items = Array.from(boutique.querySelectorAll("[data-boutique-item]"));
    var allowed = ["all", "sea", "historic", "desert", "taif", "jeddah", "corporate"];
    var query = new URLSearchParams(window.location.search);
    var initial = query.get("experience") || "all";

    if (allowed.indexOf(initial) === -1) {
      initial = "all";
    }

    function applyFilter(filter, updateUrl) {
      items.forEach(function (item) {
        var categories = (item.getAttribute("data-category") || "").split(/\s+/).filter(Boolean);
        item.hidden = filter !== "all" && categories.indexOf(filter) === -1;
      });

      buttons.forEach(function (button) {
        var active = button.getAttribute("data-boutique-filter") === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (updateUrl && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (filter === "all") {
          url.searchParams.delete("experience");
        } else {
          url.searchParams.set("experience", filter);
        }
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-boutique-filter"), true);
      });
    });

    applyFilter(initial, false);
  }

  function setupReveals() {
    var elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) {
      return;
    }

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.12 });

    elements.forEach(function (element) { observer.observe(element); });
  }

  function setupCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) {
      return;
    }

    var dateField = form.querySelector('[name="date"]');
    if (dateField) {
      var today = new Date();
      var localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
      dateField.setAttribute("min", localDate);
    }

    var query = new URLSearchParams(window.location.search);
    var requestedType = query.get("type");
    var allowedTypes = ["experience", "event", "corporate", "service", "collection", "other"];
    var typeField = form.querySelector('[name="type"]');
    if (typeField && allowedTypes.indexOf(requestedType) !== -1) {
      typeField.value = requestedType;
    }

    var requestKeys = {
      "planning": "services.s1Title",
      "meet-assist": "services.s2Title",
      "transport": "services.s3Title",
      "guide": "services.s4Title",
      "hospitality": "services.s5Title",
      "destination": "services.s6Title",
      "thobe": "services.s7Title",
      "abaya": "services.s8Title",
      "golden-hour": "experiences.goldenTitle",
      "sunset-moment": "experiences.sunsetTitle",
      "bayadah-day": "experiences.bayadahTitle",
      "bayadah-grand": "experiences.grandTitle",
      "historic-walk": "experiences.heritageSmallTitle",
      "historic-group": "experiences.heritageGroupTitle",
      "historic-transport": "experiences.heritageStandardTitle",
      "historic-vip": "experiences.heritageVipTitle",
      "historic-dinner": "experiences.dinnerNoteTitle",
      "sea-to-balad": "experiences.signature1Title",
      "jeddah-day": "experiences.jeddahTitle",
      "sea-box": "collection.box1Title",
      "historic-box": "collection.box2Title",
      "desert-box": "collection.box3Title",
      "taif-box": "collection.box4Title",
      "jeddah-box": "collection.box5Title",
      "executive-arrival": "corporate.package1Title",
      "leadership-half-day": "corporate.package2Title",
      "team-discovery": "corporate.package3Title"
    };
    var requestedItem = query.get("request");
    var requestKey = requestKeys[requestedItem];
    var messageField = form.querySelector('[name="message"]');

    function applyRequestedItem() {
      if (!requestKey || !messageField) {
        return;
      }
      if (!messageField.value || messageField.dataset.autofilled === "true") {
        messageField.value = translate("contact.requestedItem") + ": " + translate(requestKey);
        messageField.dataset.autofilled = "true";
      }
    }

    applyRequestedItem();
    document.addEventListener("aventura:language", applyRequestedItem);
    if (messageField) {
      messageField.addEventListener("input", function () {
        messageField.dataset.autofilled = "false";
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var email = String(data.get("email") || "").trim();
      var status = form.querySelector("[data-form-status]");

      if (!name || (!phone && !email)) {
        if (status) {
          status.textContent = translate("contact.error");
        }
        return;
      }

      if (status) {
        status.textContent = "";
      }

      var selectedType = form.querySelector('[name="type"] option:checked');
      var typeText = selectedType ? selectedType.textContent.trim() : "";
      var lines = [
        translate("contact.whatsappIntro"),
        "",
        translate("contact.whatsappName") + ": " + name
      ];

      var optionalRows = [
        ["company", "contact.whatsappCompany"],
        ["phone", "contact.whatsappPhone"],
        ["email", "contact.whatsappEmail"]
      ];

      optionalRows.forEach(function (row) {
        var value = String(data.get(row[0]) || "").trim();
        if (value) {
          lines.push(translate(row[1]) + ": " + value);
        }
      });

      if (typeText) {
        lines.push(translate("contact.whatsappType") + ": " + typeText);
      }

      var selectedDuration = form.querySelector('[name="duration"] option:checked');
      if (selectedDuration && selectedDuration.value) {
        lines.push(translate("contact.whatsappDuration") + ": " + selectedDuration.textContent.trim());
      }

      [["date", "contact.whatsappDate"], ["time", "contact.whatsappTime"], ["guests", "contact.whatsappGuests"], ["message", "contact.whatsappMessage"]].forEach(function (row) {
        var value = String(data.get(row[0]) || "").trim();
        if (value) {
          lines.push(translate(row[1]) + ": " + value);
        }
      });

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  function setupPartnerForm() {
    var form = document.querySelector("[data-partner-form]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var partnerType = String(data.get("partnerType") || "").trim();
      var name = String(data.get("name") || "").trim();
      var country = String(data.get("country") || "").trim();
      var city = String(data.get("city") || "").trim();
      var category = String(data.get("category") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var email = String(data.get("email") || "").trim();
      var message = String(data.get("message") || "").trim();
      var consent = String(data.get("consent") || "").trim();
      var status = form.querySelector("[data-partner-status]");

      if (!partnerType || !name || !country || !city || !category || (!phone && !email) || !message || !consent) {
        if (status) {
          status.textContent = translate("partners.error");
        }
        return;
      }

      if (status) {
        status.textContent = "";
      }

      var typeKey = partnerType === "organization" ? "partners.typeOrgTitle" : "partners.typeProTitle";
      var categoryOption = form.querySelector('[name="category"] option:checked');
      var categoryText = categoryOption ? categoryOption.textContent.trim() : category;
      var lines = [
        translate("partners.whatsappIntro"),
        "",
        translate("partners.typeLegend") + ": " + translate(typeKey),
        translate("partners.nameLabel") + ": " + name
      ];

      [
        ["brand", "partners.brandLabel"],
        ["country", "partners.countryLabel"],
        ["city", "partners.cityLabel"],
        ["phone", "partners.phoneLabel"],
        ["email", "partners.emailLabel"]
      ].forEach(function (row) {
        var value = String(data.get(row[0]) || "").trim();
        if (value) {
          lines.push(translate(row[1]) + ": " + value);
        }
      });

      lines.push(translate("partners.categoryLabel") + ": " + categoryText);

      [
        ["website", "partners.websiteLabel"],
        ["experience", "partners.experienceLabel"],
        ["license", "partners.licenseLabel"],
        ["languages", "partners.languagesLabel"],
        ["coverage", "partners.coverageLabel"],
        ["capacity", "partners.capacityLabel"],
        ["message", "partners.messageLabel"]
      ].forEach(function (row) {
        var value = String(data.get(row[0]) || "").trim();
        if (value) {
          lines.push(translate(row[1]) + ": " + value);
        }
      });

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  function setupExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
      if (rel.indexOf("noopener") === -1) {
        rel.push("noopener");
      }
      link.setAttribute("rel", rel.join(" "));
    });
  }

  function init() {
    registerComponents();
    setupLanguageSwitcher();
    applyLanguage(getInitialLanguage(), false);
    setupHeader();
    setupBoutiqueFilters();
    setupReveals();
    setupCurrentYear();
    setupContactForm();
    setupPartnerForm();
    setupExternalLinks();
    document.documentElement.classList.add("app-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}());

(function () {
  "use strict";

  var SUPPORTED_LANGUAGES = ["en", "ar", "es"];
  var DEFAULT_LANGUAGE = "en";
  var STORAGE_KEY = "aventura_language";
  var QUOTE_SELECTION_STORAGE_KEY = "aventura_quote_selection_v3";
  var QUOTE_SELECTION_LEGACY_KEY = "aventura_quote_selection_v2";
  var QUOTE_SELECTION_LIFETIME = 30 * 24 * 60 * 60 * 1000;
  var WHATSAPP_NUMBER = "966555884854";
  var currentLanguage = DEFAULT_LANGUAGE;
  var BOUTIQUE_CATALOG = {
    "perfume-sea": { type: "fragrance", categories: ["sea"], titleKey: "collection.p1Title", textKey: "collection.p1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", actionKey: "collection.registerInterest", image: "assets/images/perfumes/perfume-sea.webp" },
    "perfume-roshan": { type: "fragrance", categories: ["historic"], titleKey: "collection.p2Title", textKey: "collection.p2Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", actionKey: "collection.registerInterest", image: "assets/images/perfumes/perfume-roshan.webp" },
    "perfume-taif": { type: "fragrance", categories: ["taif"], titleKey: "collection.p4Title", textKey: "collection.p4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", actionKey: "collection.registerInterest", image: "assets/images/perfumes/perfume-taif.webp" },
    "perfume-noir": { type: "fragrance", categories: ["jeddah"], titleKey: "collection.noirTitle", textKey: "collection.noirText", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", actionKey: "collection.registerInterest", image: "assets/images/perfumes/perfume-noir.webp" },
    "perfume-velvet": { type: "fragrance", categories: ["jeddah"], titleKey: "collection.velvetTitle", textKey: "collection.velvetText", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", actionKey: "collection.registerInterest", image: "assets/images/perfumes/perfume-velvet.webp" },

    "sea-box": { type: "box", categories: ["sea"], titleKey: "collection.box1Title", textKey: "collection.box1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "box" },
    "historic-box": { type: "box", categories: ["historic"], titleKey: "collection.box2Title", textKey: "collection.box2Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "box" },
    "desert-box": { type: "box", categories: ["desert"], titleKey: "collection.box3Title", textKey: "collection.box3Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "box" },
    "taif-box": { type: "box", categories: ["taif"], titleKey: "collection.box4Title", textKey: "collection.box4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "box" },

    "sea-tote": { type: "beach", categories: ["sea"], titleKey: "collection.productSea1Title", textKey: "collection.productSea1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "bag" },
    "sea-towel": { type: "beach", categories: ["sea"], titleKey: "collection.productSea2Title", textKey: "collection.productSea2Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "textile" },
    "sea-phone": { type: "beach", categories: ["sea"], titleKey: "collection.productSea3Title", textKey: "collection.productSea3Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "phone" },
    "sea-bottle": { type: "beach", categories: ["sea"], titleKey: "collection.productSea4Title", textKey: "collection.productSea4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "bottle" },
    "roshan-keepsake": { type: "gift", categories: ["historic"], titleKey: "collection.productHistoric1Title", textKey: "collection.productHistoric1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "keepsake" },
    "heritage-cards": { type: "gift", categories: ["historic"], titleKey: "collection.productHistoric2Title", textKey: "collection.productHistoric2Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "cards" },
    "historic-notebook": { type: "gift", categories: ["historic"], titleKey: "collection.productHistoric3Title", textKey: "collection.productHistoric3Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "notebook" },
    "historic-pouch": { type: "gift", categories: ["historic"], titleKey: "collection.productHistoric4Title", textKey: "collection.productHistoric4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "pouch" },
    "desert-shawl": { type: "gift", categories: ["desert"], titleKey: "collection.productDesert1Title", textKey: "collection.productDesert1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "textile" },
    "desert-cup": { type: "gift", categories: ["desert"], titleKey: "collection.productDesert2Title", textKey: "collection.productDesert2Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "tumbler" },
    "desert-keepsake": { type: "gift", categories: ["desert"], titleKey: "collection.productDesert3Title", textKey: "collection.productDesert3Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "keepsake" },
    "desert-glasses-case": { type: "gift", categories: ["desert"], titleKey: "collection.productDesert4Title", textKey: "collection.productDesert4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "pouch" },
    "taif-rose-mist": { type: "gift", categories: ["taif"], titleKey: "collection.productTaif1Title", textKey: "collection.productTaif1Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "mist" },
    "taif-rose-care": { type: "gift", categories: ["taif"], titleKey: "collection.productTaif4Title", textKey: "collection.productTaif4Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "care" },
    "taif-sachet": { type: "gift", categories: ["taif"], titleKey: "collection.productTaif3Title", textKey: "collection.productTaif3Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "pouch" },
    "taif-notebook": { type: "gift", categories: ["taif"], titleKey: "collection.productTaif5Title", textKey: "collection.productTaif5Text", statusKey: "common.comingSoon", prepKey: "collection.prepDevelopment", personalizationKey: "collection.personalizationAfterLaunch", visual: "notebook" }
  };
  var BOUTIQUE_TYPE_KEYS = {
    fragrance: "collection.typeFragrance",
    box: "collection.typeBox",
    beach: "collection.typeBeach",
    gift: "collection.typeGift"
  };
  var BOUTIQUE_CATEGORY_KEYS = {
    sea: "collection.filterSea",
    historic: "collection.filterHistoric",
    desert: "collection.filterDesert",
    taif: "collection.filterTaif",
    jeddah: "collection.filterJeddah"
  };

  function isInterestProduct(product) {
    return Boolean(product && product.actionKey === "collection.registerInterest");
  }

  function isRequestableProduct(product) {
    return Boolean(product && product.available === true && !isInterestProduct(product));
  }

  function isVisibleBoutiqueProduct(product) {
    return Boolean(product && ["fragrance", "box", "beach", "gift"].indexOf(product.type) !== -1);
  }

  function clampQuantity(value) {
    return Math.max(1, Math.min(500, Number(value) || 1));
  }

  function sanitizeQuoteSelection(rawState) {
    var safeState = {};
    if (!rawState || typeof rawState !== "object" || Array.isArray(rawState)) {
      return safeState;
    }

    Object.keys(rawState).forEach(function (id) {
      var product = BOUTIQUE_CATALOG[id];
      var item = rawState[id];
      if (!isRequestableProduct(product) || !item || typeof item !== "object") {
        return;
      }
      safeState[id] = {
        labelKey: product.titleKey,
        quantity: clampQuantity(item.quantity)
      };
    });
    return safeState;
  }

  function saveQuoteSelection(state) {
    var safeState = sanitizeQuoteSelection(state);
    try {
      if (Object.keys(safeState).length) {
        localStorage.setItem(QUOTE_SELECTION_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), state: safeState }));
      } else {
        localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
      }
      sessionStorage.removeItem(QUOTE_SELECTION_LEGACY_KEY);
    } catch (error) {
      /* Storage can be unavailable or disabled. */
    }
    return safeState;
  }

  function readQuoteSelection() {
    var rawState = {};
    try {
      var saved = JSON.parse(localStorage.getItem(QUOTE_SELECTION_STORAGE_KEY) || "null");
      if (saved && saved.state && Date.now() - Number(saved.savedAt || 0) <= QUOTE_SELECTION_LIFETIME) {
        rawState = saved.state;
      } else {
        localStorage.removeItem(QUOTE_SELECTION_STORAGE_KEY);
        rawState = JSON.parse(sessionStorage.getItem(QUOTE_SELECTION_LEGACY_KEY) || "{}") || {};
      }
    } catch (error) {
      rawState = {};
    }
    return saveQuoteSelection(rawState);
  }

  function removeUnsupportedBoutiqueItems() {
    document.querySelectorAll("[data-boutique-item]").forEach(function (item) {
      var action = item.querySelector("[data-quote-item], [data-interest-item]");
      var id = item.getAttribute("data-product-id") || (action && (action.getAttribute("data-quote-item") || action.getAttribute("data-interest-item")));
      if (id && !isVisibleBoutiqueProduct(BOUTIQUE_CATALOG[id])) {
        item.remove();
      }
    });
  }

  function headerMarkup() {
    return [
      '<a class="skip-link" href="#main" data-i18n="common.skip">Skip to main content</a>',
      '<header class="site-header" id="siteHeader">',
      '  <div class="container nav-shell">',
      '    <a class="brand" href="index.html" aria-label="AVENTURA home">',
      '      <img class="brand-logo" src="assets/images/aventura-logo.svg?v=header-contrast-20260730b" width="590" height="120" alt="">',
      '      <span class="sr-only" data-i18n="brand.tagline">Experiences · Events · Hospitality</span>',
      '    </a>',
      '    <nav class="primary-nav" id="primaryNav" aria-label="Primary navigation">',
      '      <a class="nav-link" data-nav="experiences" href="experiences.html"><span data-i18n="nav.experiences">Experiences</span></a>',
      '      <a class="nav-link" data-nav="corporate" data-nav-alias="events" href="corporate.html"><span data-i18n="nav.corporateEvents">Corporate &amp; Events</span></a>',
      '      <a class="nav-link" data-nav="guest-services" href="guest-services.html"><span data-i18n="nav.guestServices">Guest Services</span></a>',
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
      '      <a class="btn btn-sm header-plan" href="contact.html" data-i18n="common.plan">Request a Tailored Proposal</a>',
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
      '        <img class="brand-logo" src="assets/images/aventura-logo.svg?v=header-contrast-20260730b" width="590" height="120" alt="">',
      '        <span class="sr-only" data-i18n="brand.tagline">Experiences · Events · Hospitality</span>',
      '      </a>',
      '      <p data-i18n="footer.summary">Aventura designs private journeys, events and guest programs with thoughtful planning, trusted partners and hands-on coordination.</p>',
      '    </div>',
      '    <div class="footer-column">',
      '      <h3 data-i18n="footer.explore">Explore</h3>',
      '      <ul class="footer-links">',
      '        <li><a href="experiences.html" data-i18n="nav.experiences">Experiences</a></li>',
      '        <li><a href="corporate.html" data-i18n="nav.corporateEvents">Corporate &amp; Events</a></li>',
      '        <li><a href="events.html" data-i18n="nav.events">Events</a></li>',
      '        <li><a href="services.html" data-i18n="nav.services">Services</a></li>',
      '        <li><a href="guest-services.html" data-i18n="nav.guestServices">Guest Services</a></li>',
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

    document.querySelectorAll("[data-i18n-alt]").forEach(function (element) {
      element.setAttribute("alt", translate(element.getAttribute("data-i18n-alt"), language));
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

    var currentTitle = document.title;
    var currentDescription = document.querySelector('meta[name="description"]');
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(function (meta) {
      meta.setAttribute("content", currentTitle);
    });
    if (currentDescription) {
      document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach(function (meta) {
        meta.setAttribute("content", currentDescription.getAttribute("content") || "");
      });
    }
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute("content", language === "ar" ? "ar_SA" : language === "es" ? "es_ES" : "en_US");
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
    var active = document.querySelector('[data-nav="' + page + '"], [data-nav-alias~="' + page + '"]');

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

  function restoreDialogFocus(dialog) {
    var trigger = dialog && dialog.__aventuraReturnFocus;
    if (dialog) {
      dialog.__aventuraReturnFocus = null;
    }
    if (trigger && document.contains(trigger) && typeof trigger.focus === "function") {
      window.setTimeout(function () { trigger.focus(); }, 0);
    }
  }

  function prepareDialog(dialog) {
    if (!dialog || dialog.__aventuraPrepared) {
      return;
    }
    dialog.__aventuraPrepared = true;
    dialog.addEventListener("close", function () { restoreDialogFocus(dialog); });
    dialog.querySelectorAll(".dialog-close").forEach(function (button) {
      if (!button.hasAttribute("data-i18n-aria")) {
        button.setAttribute("data-i18n-aria", "collection.closeDetails");
      }
      button.setAttribute("aria-label", translate(button.getAttribute("data-i18n-aria")));
    });
  }

  function openAventuraDialog(dialog, trigger) {
    if (!dialog || dialog.open) {
      return;
    }
    prepareDialog(dialog);
    dialog.__aventuraReturnFocus = trigger || document.activeElement;
    dialog.setAttribute("dir", document.documentElement.dir || "ltr");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    window.setTimeout(function () {
      var target = dialog.querySelector("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    }, 0);
  }

  function closeAventuraDialog(dialog) {
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }
    dialog.removeAttribute("open");
    restoreDialogFocus(dialog);
  }

  function setupScentLabInterest() {
    function scentInterestUrl(product) {
      var message = [
        translate("collection.scentLabName"),
        "",
        translate("collection.registerInterest") + ": " + translate(product.titleKey)
      ].join("\n");
      return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    }

    function updateInterestLabels() {
      document.querySelectorAll("[data-scent-interest], [data-interest-item]").forEach(function (button) {
        var productId = button.getAttribute("data-scent-id") || button.getAttribute("data-interest-item");
        var product = BOUTIQUE_CATALOG[productId];
        if (isInterestProduct(product)) {
          button.setAttribute("aria-label", translate(product.actionKey) + ": " + translate(product.titleKey));
          if (button.tagName === "A") {
            button.setAttribute("href", scentInterestUrl(product));
            button.setAttribute("target", "_blank");
            button.setAttribute("rel", "noopener");
          }
        }
      });
    }

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-scent-interest], [data-interest-item]");
      if (!button) {
        return;
      }
      var productId = button.getAttribute("data-scent-id") || button.getAttribute("data-interest-item");
      var product = BOUTIQUE_CATALOG[productId];
      if (!isInterestProduct(product)) {
        return;
      }
      event.preventDefault();
      if (window.AVENTURA_TRACK) {
        window.AVENTURA_TRACK("scent_interest", { productId: productId });
      }
      window.open(scentInterestUrl(product), "_blank", "noopener");
    });

    document.addEventListener("aventura:language", updateInterestLabels);
    updateInterestLabels();
  }

  function setupBoutiqueCatalog() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) {
      return;
    }

    var items = Array.from(boutique.querySelectorAll("[data-boutique-item]"));
    var dialog = document.querySelector("[data-product-dialog]");
    var activeAction = null;
    var activeProduct = null;

    function createTag(key, className) {
      var tag = document.createElement("span");
      tag.className = className || "";
      tag.setAttribute("data-i18n", key);
      tag.textContent = translate(key);
      return tag;
    }

    function createContextTags(product) {
      var tags = document.createElement("div");
      tags.className = "product-context-tags";
      tags.appendChild(createTag(BOUTIQUE_TYPE_KEYS[product.type], "product-type-tag"));
      if (product.categories[0] && BOUTIQUE_CATEGORY_KEYS[product.categories[0]]) {
        tags.appendChild(createTag(BOUTIQUE_CATEGORY_KEYS[product.categories[0]], "product-collection-tag"));
      }
      return tags;
    }

    function cloneProductVisual(item, product) {
      var sourceImage = item.querySelector(".perfume-card-media img");
      if (sourceImage) {
        var image = sourceImage.cloneNode(true);
        image.removeAttribute("loading");
        image.removeAttribute("fetchpriority");
        return image;
      }
      var source = item.querySelector(".box-preview, .catalog-product-visual");
      if (source) {
        var clone = source.cloneNode(true);
        clone.removeAttribute("data-reveal");
        return clone;
      }
      var service = document.createElement("div");
      service.className = "product-detail-service-visual";
      service.setAttribute("aria-hidden", "true");
      service.innerHTML = "<span>A</span>";
      return service;
    }

    function updateOpenDialog() {
      if (!dialog || !activeProduct) {
        return;
      }
      dialog.querySelector("[data-product-dialog-title]").textContent = translate(activeProduct.titleKey);
      dialog.querySelector("[data-product-dialog-description]").textContent = translate(activeProduct.textKey);
      dialog.querySelector("[data-product-dialog-status]").textContent = translate(activeProduct.statusKey);
      dialog.querySelector("[data-product-dialog-prep]").textContent = translate(activeProduct.prepKey);
      dialog.querySelector("[data-product-dialog-personalization]").textContent = translate(activeProduct.personalizationKey);
      dialog.querySelector("[data-product-dialog-collection]").textContent = translate(BOUTIQUE_CATEGORY_KEYS[activeProduct.categories[0]]);
      var dialogAction = dialog.querySelector("[data-product-dialog-action]");
      dialogAction.textContent = translate(activeProduct.actionKey);
      dialogAction.classList.toggle("interest-action", activeProduct.actionKey === "collection.registerInterest");

      var tags = dialog.querySelector("[data-product-dialog-tags]");
      tags.textContent = "";
      tags.appendChild(createTag(BOUTIQUE_TYPE_KEYS[activeProduct.type], "product-type-tag"));
      tags.appendChild(createTag(BOUTIQUE_CATEGORY_KEYS[activeProduct.categories[0]], "product-collection-tag"));
    }

    function openProductDialog(item, product) {
      if (!dialog) {
        return;
      }
      activeProduct = product;
      activeAction = item.querySelector("[data-quote-item], [data-interest-item]");
      var visual = dialog.querySelector("[data-product-dialog-visual]");
      visual.textContent = "";
      visual.appendChild(cloneProductVisual(item, product));
      updateOpenDialog();
      openAventuraDialog(dialog, item.querySelector(".product-details-button") || activeAction);
    }

    items.forEach(function (item) {
      var action = item.querySelector("[data-quote-item], [data-interest-item]");
      var id = item.getAttribute("data-product-id") || (action && (action.getAttribute("data-quote-item") || action.getAttribute("data-interest-item"))) || "";
      var product = BOUTIQUE_CATALOG[id];
      if (!product) {
        item.remove();
        return;
      }

      item.setAttribute("data-product-id", id);
      item.setAttribute("data-product-type", product.type);
      item.setAttribute("data-category", product.categories.join(" "));
      if (action && product.actionKey) {
        action.setAttribute("data-i18n", product.actionKey);
        action.setAttribute("data-quote-label-key", product.titleKey);
      }
      if (action && isInterestProduct(product)) {
        action.setAttribute("data-interest-item", id);
        action.removeAttribute("data-quote-item");
        action.removeAttribute("data-quote-label-key");
        action.classList.remove("quote-add-button");
        action.classList.add("product-details-button");
        action.classList.add("interest-action");
        action.setAttribute("aria-label", translate(product.actionKey) + ": " + translate(product.titleKey));
        var quantityControl = item.querySelector('[data-item-quantity="' + id + '"]');
        if (quantityControl) {
          var quantityLabel = quantityControl.closest("label");
          if (quantityLabel) {
            quantityLabel.remove();
          }
        }
      }

      var content = item.querySelector(".perfume-card-copy, .boutique-card-content, .catalog-product-content");
      if (!content && item.classList.contains("perfume-card-pending")) {
        content = item.querySelector("div");
      }
      content = content || item;
      content.insertBefore(createContextTags(product), content.firstChild);

      var prep = document.createElement("p");
      prep.className = "product-prep-line";
      var prepLabel = document.createElement("span");
      prepLabel.setAttribute("data-i18n", "collection.preparationLabel");
      prepLabel.textContent = translate("collection.preparationLabel");
      var prepValue = document.createElement("strong");
      prepValue.setAttribute("data-i18n", product.prepKey);
      prepValue.textContent = translate(product.prepKey);
      prep.append(prepLabel, prepValue);
      var description = content.querySelector("p:not(.product-prep-line)");
      if (description && description.nextSibling) {
        content.insertBefore(prep, description.nextSibling);
      } else {
        content.appendChild(prep);
      }

      var visual = item.querySelector(".catalog-product-visual");
      if (visual && product.visual) {
        var object = document.createElement("div");
        object.className = "catalog-product-object";
        object.setAttribute("data-shape", product.visual);
        object.setAttribute("aria-hidden", "true");
        object.innerHTML = "<span>A</span>";
        visual.appendChild(object);
      }

      if (action) {
        var details = document.createElement("button");
        details.className = "product-details-button";
        details.type = "button";
        details.setAttribute("data-i18n", "collection.viewDetails");
        details.textContent = translate("collection.viewDetails");
        details.addEventListener("click", function () { openProductDialog(item, product); });
        var actions = item.querySelector(".catalog-card-actions, .perfume-card-actions");
        if (actions) {
          actions.insertBefore(details, action);
        } else {
          action.parentNode.insertBefore(details, action);
        }
      }
    });

    if (dialog) {
      prepareDialog(dialog);
      dialog.querySelectorAll("[data-close-product-dialog]").forEach(function (button) {
        button.addEventListener("click", function () { closeAventuraDialog(dialog); });
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          closeAventuraDialog(dialog);
        }
      });
      dialog.querySelector("[data-product-dialog-action]").addEventListener("click", function () {
        if (activeAction) {
          activeAction.click();
        }
        closeAventuraDialog(dialog);
      });
      document.addEventListener("aventura:language", function () {
        if (dialog.open) {
          updateOpenDialog();
        }
        items.forEach(function (item) {
          var interestButton = item.querySelector("[data-interest-item]");
          var id = interestButton && interestButton.getAttribute("data-interest-item");
          var interestProduct = BOUTIQUE_CATALOG[id];
          if (interestButton && isInterestProduct(interestProduct)) {
            interestButton.setAttribute("aria-label", translate(interestProduct.actionKey) + ": " + translate(interestProduct.titleKey));
          }
        });
      });
    }
  }

  function arrangeBoutiqueSections() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) {
      return;
    }
    var main = boutique.querySelector("main") || document.querySelector("main");
    var process = boutique.querySelector(".boutique-process");
    var boxes = document.getElementById("boxes");
    var reorder = document.getElementById("reorder");
    var fragrances = document.getElementById("fragrances");
    var cta = main && main.querySelector(".cta-band");

    if (process && boxes) {
      main.insertBefore(process, boxes);
    }
    if (reorder && cta) {
      main.insertBefore(reorder, cta);
    }
    if (fragrances && cta) {
      main.insertBefore(fragrances, cta);
    }
  }

  function setupBoutiqueFilters() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) {
      return;
    }

    var experienceButtons = Array.from(boutique.querySelectorAll("[data-boutique-filter]"));
    var typeButtons = Array.from(boutique.querySelectorAll("[data-boutique-type]"));
    var items = Array.from(boutique.querySelectorAll("[data-boutique-item]"));
    var sections = Array.from(boutique.querySelectorAll("[data-boutique-section]"));
    var search = boutique.querySelector("[data-boutique-search]");
    var resultCount = boutique.querySelector("[data-boutique-results]");
    var empty = boutique.querySelector("[data-boutique-empty]");
    var allowedExperiences = ["all", "sea", "historic", "desert", "taif", "jeddah"];
    var allowedTypes = ["all", "fragrance", "box", "beach", "gift"];
    function readStateFromUrl() {
      var query = new URLSearchParams(window.location.search);
      var nextState = {
        experience: query.get("experience") || "all",
        type: query.get("productType") || "all",
        search: query.get("q") || ""
      };
      if (allowedExperiences.indexOf(nextState.experience) === -1) {
        nextState.experience = "all";
      }
      if (allowedTypes.indexOf(nextState.type) === -1) {
        nextState.type = "all";
      }
      return nextState;
    }

    var state = readStateFromUrl();
    if (search) {
      search.value = state.search;
    }

    function normalize(value) {
      var text = String(value || "").toLocaleLowerCase();
      if (typeof text.normalize === "function") {
        text = text.normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f]/g, "");
      }
      return text.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    }

    function matchesExperience(categories) {
      if (state.experience === "all") {
        return true;
      }
      return categories.indexOf(state.experience) !== -1;
    }

    function updateUrl(historyMode, hash) {
      if (!window.history || !window.history.replaceState) {
        return;
      }
      var url = new URL(window.location.href);
      state.experience === "all" ? url.searchParams.delete("experience") : url.searchParams.set("experience", state.experience);
      state.type === "all" ? url.searchParams.delete("productType") : url.searchParams.set("productType", state.type);
      state.search ? url.searchParams.set("q", state.search) : url.searchParams.delete("q");
      if (hash !== undefined) {
        url.hash = hash;
      }
      var method = historyMode === "push" && window.history.pushState ? "pushState" : "replaceState";
      window.history[method]({}, "", url.pathname + url.search + url.hash);
    }

    function applyFilters(shouldUpdateUrl, historyMode) {
      var searchTerm = normalize(state.search);
      var visible = 0;

      items.forEach(function (item) {
        var id = item.getAttribute("data-product-id") || "";
        var product = BOUTIQUE_CATALOG[id];
        var categories = (item.getAttribute("data-category") || "").split(/\s+/).filter(Boolean);
        var typeMatches = state.type === "all" || item.getAttribute("data-product-type") === state.type;
        var searchable = item.textContent;
        var searchMatches = !searchTerm || normalize(searchable).indexOf(searchTerm) !== -1;
        item.hidden = !(matchesExperience(categories) && typeMatches && searchMatches);
        if (!item.hidden) {
          visible += 1;
        }
      });

      sections.forEach(function (section) {
        var sectionItems = Array.from(section.querySelectorAll("[data-boutique-item]"));
        section.hidden = sectionItems.length === 0 || sectionItems.every(function (item) { return item.hidden; });
      });

      experienceButtons.forEach(function (button) {
        var active = button.getAttribute("data-boutique-filter") === state.experience;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      typeButtons.forEach(function (button) {
        var active = button.getAttribute("data-boutique-type") === state.type;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (resultCount) {
        resultCount.textContent = String(visible);
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
      if (shouldUpdateUrl) {
        updateUrl(historyMode);
      }
    }

    experienceButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.experience = button.getAttribute("data-boutique-filter");
        applyFilters(true, "push");
      });
    });
    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var type = button.getAttribute("data-boutique-type");
        state.type = type;
        applyFilters(true, "push");
      });
    });
    if (search) {
      search.addEventListener("input", function () {
        state.search = search.value.trim();
        applyFilters(true, "replace");
      });
    }
    boutique.querySelectorAll("[data-clear-boutique-search]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.search = "";
        search.value = "";
        applyFilters(true, "push");
        search.focus();
      });
    });
    boutique.querySelectorAll("[data-clear-boutique-filters]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.experience = "all";
        state.type = "all";
        state.search = "";
        if (search) {
          search.value = "";
        }
        applyFilters(true, "push");
      });
    });
    boutique.querySelectorAll("[data-boutique-path]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = button.getAttribute("data-boutique-path") === "product" ? search : document.getElementById("experienceFilters");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          if (target === search) {
            window.setTimeout(function () { search.focus(); }, 350);
          }
        }
      });
    });

    window.addEventListener("popstate", function () {
      state = readStateFromUrl();
      if (search) {
        search.value = state.search;
      }
      applyFilters(false);
    });

    document.addEventListener("aventura:language", function () { applyFilters(false); });
    applyFilters(false);
  }

  function setupExperienceDetail() {
    var root = document.querySelector("[data-experience-detail]");
    if (!root) {
      return;
    }

    var sets = {
      sea: {
        request: "sea",
        theme: "sea",
        journey: "sea",
        perfume: { id: "perfume-sea", titleKey: "collection.p1Title", textKey: "experienceDetail.perfumeSeaText", image: "assets/images/perfumes/perfume-sea.webp", story: "assets/images/perfumes/perfume-sea-story.webp" }
      },
      golden: { alias: "sea", request: "golden-hour", theme: "sea", journey: "golden" },
      sunset: { alias: "sea", request: "sunset-moment", theme: "sea", journey: "sunset" },
      bayadah: { alias: "sea", request: "bayadah-day", theme: "sea", journey: "bayadah" },
      "grand-bayadah": { alias: "sea", request: "bayadah-grand", theme: "sea", journey: "grandBayadah" },
      historic: {
        request: "historic-walk",
        theme: "historic",
        journey: "historic",
        perfume: { id: "perfume-roshan", titleKey: "collection.p2Title", textKey: "experienceDetail.perfumeRoshanText", image: "assets/images/perfumes/perfume-roshan.webp", story: "assets/images/perfumes/perfume-roshan-story.webp" }
      },
      desert: {
        request: "desert",
        theme: "desert",
        journey: "desert"
      },
      taif: {
        request: "taif",
        theme: "taif",
        journey: "taif",
        perfume: { id: "perfume-taif", titleKey: "collection.p4Title", textKey: "experienceDetail.perfumeTaifText", image: "assets/images/perfumes/perfume-taif.webp", story: "assets/images/perfumes/perfume-taif-story.webp" }
      },
      jeddah: {
        request: "jeddah-day",
        theme: "jeddah",
        journey: "jeddah",
        perfumes: [
          { id: "perfume-noir", titleKey: "collection.noirTitle", textKey: "collection.noirText", image: "assets/images/perfumes/perfume-noir.webp", story: "assets/images/perfumes/perfume-noir-story.webp" },
          { id: "perfume-velvet", titleKey: "collection.velvetTitle", textKey: "collection.velvetText", image: "assets/images/perfumes/perfume-velvet.webp", story: "assets/images/perfumes/perfume-velvet-story.webp" }
        ]
      },
      "sea-to-balad": {
        request: "sea-to-balad",
        theme: "sea-to-balad",
        journey: "seaToBalad",
        perfumes: [
          { id: "perfume-sea", titleKey: "collection.p1Title", textKey: "experienceDetail.perfumeSeaText", image: "assets/images/perfumes/perfume-sea.webp", story: "assets/images/perfumes/perfume-sea-story.webp" },
          { id: "perfume-roshan", titleKey: "collection.p2Title", textKey: "experienceDetail.perfumeRoshanText", image: "assets/images/perfumes/perfume-roshan.webp", story: "assets/images/perfumes/perfume-roshan-story.webp" }
        ]
      }
    };

    var experienceId = root.getAttribute("data-experience-id");
    var config = sets[experienceId];
    if (!config) {
      return;
    }

    if (config.alias) {
      var base = sets[config.alias];
      config = Object.assign({}, base, config);
    }

    var perfumes = (config.perfumes || [config.perfume]).filter(Boolean);
    // Physical products and boxes remain off-site until samples, suppliers and
    // final product imagery are approved. Only fragrance concepts may appear.
    var products = [];
    var fragranceOnly = true;
    var hasStaticExperienceStory = document.body.hasAttribute("data-static-experience-story");
    var journeyKey = config.journey || experienceId;
    var journeyPrefix = "journey." + journeyKey;
    var journeyTheme = config.theme || "jeddah";
    var productEyebrowKey = "collection.perfumeEyebrow";
    var productTitleKey = "collection.perfumeTitle";
    var productTextKey = "collection.perfumeText";

    function quantityMarkup(id) {
      return '<label class="quantity-control"><span data-i18n="collection.quantity">Quantity</span><input type="number" min="1" max="100" value="1" inputmode="numeric" data-item-quantity="' + id + '"></label>';
    }

    function perfumeMarkup(perfume) {
      var visual = perfume.image
        ? '<div class="detail-perfume-visual"><img src="' + perfume.image + '" width="900" height="1125" loading="eager" decoding="async" alt=""></div>'
        : '<div class="detail-perfume-visual perfume-card-pending"><div><span class="eyebrow">LAST LIGHT</span><strong data-i18n="collection.lastLightPending">Marketing card in preparation</strong></div></div>';
      var storyButton = perfume.story
        ? '<button class="text-link" type="button" data-perfume-story="' + perfume.story + '" data-story-title-key="' + perfume.titleKey + '" data-i18n="collection.viewStoryCard">View story card</button>'
        : '';
      return '<article class="catalog-product-card detail-perfume-product" data-reveal>' + visual +
        '<div class="catalog-product-content"><span class="status coming" data-i18n="common.comingSoon">Coming soon</span>' +
        '<h3 data-i18n="' + perfume.titleKey + '">Aventura fragrance</h3><p data-i18n="' + perfume.textKey + '">An experience-inspired fragrance.</p>' +
        storyButton + '<div class="catalog-card-actions"><button class="text-link product-details-button interest-action" type="button" data-interest-item="' + perfume.id + '" data-i18n="collection.registerInterest">Register interest</button></div></div></article>';
    }

    function productMarkup(product) {
      var seasonal = product[5];
      return '<article class="catalog-product-card" data-reveal><div class="catalog-product-visual ' + product[1] + '"><span>AVENTURA</span><strong data-i18n="' + product[2] + '">Product</strong></div>' +
        '<div class="catalog-product-content"><span class="status' + (seasonal ? '' : ' available') + '" data-i18n="' + (seasonal ? 'common.seasonal' : 'common.madeToOrder') + '">' + (seasonal ? 'Seasonal' : 'Made to order') + '</span>' +
        '<h3 data-i18n="' + product[3] + '">Product</h3><p data-i18n="' + product[4] + '">Product details.</p>' +
        '<div class="catalog-card-actions">' + quantityMarkup(product[0]) + '<button class="text-link quote-add-button" type="button" data-quote-item="' + product[0] + '" data-quote-label-key="' + product[3] + '" data-i18n="experienceDetail.includeOptional">Include in my experience request</button></div></div></article>';
    }

    function boxMarkup(box) {
      var items = box[5].map(function (key) { return '<li data-i18n="' + key + '">Collection item</li>'; }).join("");
      return '<article class="boutique-card experience-complete-box" data-reveal><div class="box-preview ' + box[1] + '"><div class="box-shell"><span class="box-monogram">A</span><span class="box-name">' + box[2] + '</span></div></div>' +
        '<div class="boutique-card-content"><span class="status available" data-i18n="common.madeToOrder">Made to order</span><h3 data-i18n="' + box[3] + '">Complete collection</h3><p data-i18n="' + box[4] + '">Complete experience collection.</p><ul class="box-items">' + items + '</ul>' +
        '<div class="catalog-card-actions">' + quantityMarkup(box[0]) + '<button class="text-link quote-add-button" type="button" data-quote-item="' + box[0] + '" data-quote-label-key="' + box[3] + '" data-i18n="experienceDetail.includeBox">Include this keepsake box</button></div></div></article>';
    }

    var requestHref = "contact.html?type=experience&request=" + encodeURIComponent(config.request);
    document.body.classList.add("experience-marketing-" + journeyTheme);

    function journeyStepMarkup(index) {
      return '<li class="experience-stage" data-reveal><span class="experience-stage-index">0' + index + '</span><div><h3 data-i18n="' + journeyPrefix + '.step' + index + 'Title">Experience moment</h3><p data-i18n="' + journeyPrefix + '.step' + index + 'Text">Aventura shapes each part around your guests.</p></div></li>';
    }

    function journeyMarkup() {
      return [
        '<section class="experience-journey-section" id="experience-journey" aria-labelledby="experienceJourneyTitle">',
        '  <div class="container">',
        '    <div class="experience-journey-heading" data-reveal>',
        '      <span class="eyebrow" data-i18n="' + journeyPrefix + '.eyebrow">Your private experience</span>',
        '      <h2 id="experienceJourneyTitle" data-i18n="' + journeyPrefix + '.title">The experience begins before you arrive</h2>',
        '      <p class="lead" data-i18n="' + journeyPrefix + '.text">Aventura shapes the experience around the people, moment and pace you have in mind.</p>',
        '    </div>',
        '    <ol class="experience-stage-grid">' + [1, 2, 3].map(journeyStepMarkup).join("") + '</ol>',
        '  </div>',
        '</section>'
      ].join("");
    }

    var relatedIds = [];

    root.setAttribute("data-related-items", relatedIds.join(","));
    root.setAttribute("data-experience-request-key", config.request);
    var fragranceSection = perfumes.length ? [
      '<section class="section experience-products-section" id="experience-products">',
      '  <div class="container">',
      '    <div class="section-heading" data-reveal><div><span class="eyebrow" data-i18n="' + productEyebrowKey + '">Aventura Scent Lab</span><h2 data-i18n="' + productTitleKey + '">Fragrance concepts in development</h2></div><p data-i18n="' + productTextKey + '">These concepts translate each Aventura experience into a scent direction. They are not available to request or purchase yet.</p></div>',
      '    <div class="catalog-product-grid detail-product-grid detail-product-grid--fragrance-only">' + perfumes.map(perfumeMarkup).join("") + '</div>',
      '  </div>',
      '</section>'
    ].join("") : "";
    var fragranceDialog = perfumes.some(function (perfume) { return Boolean(perfume.story); })
      ? '<dialog class="perfume-story-dialog" data-perfume-story-dialog aria-labelledby="experiencePerfumeStoryTitle"><div class="perfume-story-dialog-head"><div><span class="eyebrow" data-i18n="collection.storyDialogEyebrow">Fragrance campaign</span><h2 id="experiencePerfumeStoryTitle" data-perfume-story-title>Fragrance story card</h2></div><button class="dialog-close" type="button" data-close-perfume-story data-i18n-aria="collection.closeStoryCard" aria-label="Close story card">×</button></div><img data-perfume-story-image src="assets/images/perfumes/perfume-sea-story.webp" width="900" height="1125" alt=""></dialog>'
      : "";
    root.innerHTML = [hasStaticExperienceStory ? "" : journeyMarkup(), fragranceSection, fragranceDialog].join("");

    var formats = document.querySelector("[data-experience-formats]");
    var productsSection = root.querySelector("#experience-products");
    if (formats && productsSection) {
      root.insertBefore(formats, productsSection);
    }

    document.querySelectorAll("[data-experience-request]").forEach(function (button) {
      button.setAttribute("data-related-items", relatedIds.join(","));
    });

    var reminder = root.querySelector("[data-experience-product-dialog]");
    prepareDialog(reminder);
    var pendingHref = requestHref;
    var bypassKey = "aventura_product_reminder_" + experienceId;
    var reminderLifetime = 30 * 24 * 60 * 60 * 1000;

    function reminderWasSeen() {
      try {
        var seenAt = Number(localStorage.getItem(bypassKey) || 0);
        return seenAt > 0 && Date.now() - seenAt <= reminderLifetime;
      } catch (error) {
        return false;
      }
    }

    function rememberReminder() {
      try { localStorage.setItem(bypassKey, String(Date.now())); } catch (error) { /* Ignore. */ }
    }

    function readSelections() {
      return readQuoteSelection();
    }

    function selectedItems(state) {
      return relatedIds.filter(function (id) { return Boolean(state[id]); });
    }

    function hrefWithSelections(href, state) {
      var selected = selectedItems(state);
      if (!selected.length) {
        return href;
      }
      var url = new URL(href, window.location.href);
      url.searchParams.set("items", selected.map(function (id) {
        return id + ":" + Math.max(1, Number(state[id].quantity) || 1);
      }).join(","));
      url.searchParams.set("lang", currentLanguage);
      return url.pathname + url.search;
    }

    document.querySelectorAll("[data-experience-request]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        var state = readSelections();
        var selected = selectedItems(state);
        pendingHref = hrefWithSelections(button.getAttribute("href"), state);
        var bypassed = reminderWasSeen();
        var directBooking = button.hasAttribute("data-direct-booking");
        if (selected.length || bypassed || !reminder || directBooking) {
          if (pendingHref !== button.getAttribute("href")) {
            event.preventDefault();
            window.location.href = pendingHref;
          }
          return;
        }
        event.preventDefault();
        rememberReminder();
        openAventuraDialog(reminder, button);
      });
    });

    var viewProducts = root.querySelector("[data-view-experience-products]");
    if (viewProducts) {
      viewProducts.addEventListener("click", function () {
        closeAventuraDialog(reminder);
        document.getElementById("experience-products").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    var continueWithout = root.querySelector("[data-continue-without-products]");
    if (continueWithout) {
      continueWithout.addEventListener("click", function () {
        rememberReminder();
        window.location.href = pendingHref;
      });
    }
  }

  function setupBoutiqueQuoteSelection() {
    var boutique = document.querySelector("[data-boutique], [data-experience-detail]");
    if (!boutique) {
      return;
    }

    var buttons = Array.from(document.querySelectorAll("[data-quote-item]")).filter(function (button) {
      return isRequestableProduct(BOUTIQUE_CATALOG[button.getAttribute("data-quote-item")]);
    });
    var bar = document.querySelector("[data-quote-bar]");
    var countElement = document.querySelector("[data-quote-count]");
    var previewElement = document.querySelector("[data-quote-preview]");
    var dialog = document.querySelector("[data-quote-dialog]");
    var list = document.querySelector("[data-quote-list]");
    var state = readQuoteSelection();

    function save() {
      state = saveQuoteSelection(state);
    }

    function totalQuantity() {
      return Object.keys(state).reduce(function (total, id) {
        return total + clampQuantity(state[id].quantity);
      }, 0);
    }

    function quantityForButton(button, id) {
      var card = button.closest("article") || button.parentElement;
      var input = card ? card.querySelector('[data-item-quantity="' + id + '"]') : null;
      return input ? clampQuantity(input.value) : 1;
    }

    function updateButtons() {
      buttons.forEach(function (button) {
        var id = button.getAttribute("data-quote-item");
        var selected = Boolean(state[id]);
        var defaultKey = button.getAttribute("data-i18n") || "collection.addItem";
        var selectedKey = "collection.added";
        button.classList.toggle("is-added", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        button.textContent = translate(selected ? selectedKey : defaultKey);
      });
    }

    function renderDialog() {
      if (!list) {
        return;
      }
      list.textContent = "";

      Object.keys(state).forEach(function (id) {
        var item = state[id];
        var row = document.createElement("div");
        row.className = "quote-dialog-item";

        var name = document.createElement("strong");
        name.textContent = translate(item.labelKey);

        var quantity = document.createElement("input");
        quantity.type = "number";
        quantity.min = "1";
        quantity.max = "500";
        quantity.inputMode = "numeric";
        quantity.value = String(clampQuantity(item.quantity));
        quantity.setAttribute("aria-label", translate("collection.quantity"));
        quantity.addEventListener("change", function () {
          state[id].quantity = clampQuantity(quantity.value);
          quantity.value = String(state[id].quantity);
          save();
          updateSummary();
        });

        var remove = document.createElement("button");
        remove.className = "quote-remove";
        remove.type = "button";
        remove.textContent = translate("collection.removeItem");
        remove.addEventListener("click", function () {
          delete state[id];
          save();
          updateSummary();
          renderDialog();
        });

        row.append(name, quantity, remove);
        list.appendChild(row);
      });
    }

    function updateSummary() {
      var count = totalQuantity();
      if (bar) {
        bar.hidden = count === 0;
      }
      if (countElement) {
        countElement.textContent = String(count);
      }
      if (previewElement) {
        var names = Object.keys(state).slice(0, 2).map(function (id) {
          return translate(state[id].labelKey);
        });
        var remaining = Math.max(0, Object.keys(state).length - names.length);
        previewElement.textContent = names.join(" · ") + (remaining ? " · +" + remaining : "");
      }
      updateButtons();
    }

    function quoteUrl() {
      state = sanitizeQuoteSelection(state);
      var encodedItems = Object.keys(state).map(function (id) {
        return id + ":" + clampQuantity(state[id].quantity);
      }).join(",");
      var url = new URL("contact.html", window.location.href);
      var detail = document.querySelector("[data-experience-detail]");
      url.searchParams.set("type", detail ? "experience" : "collection");
      if (detail && detail.getAttribute("data-experience-request-key")) {
        url.searchParams.set("request", detail.getAttribute("data-experience-request-key"));
      }
      url.searchParams.set("items", encodedItems);
      url.searchParams.set("lang", currentLanguage);
      return url.pathname + url.search;
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-quote-item");
        var catalogProduct = BOUTIQUE_CATALOG[id];
        if (!id || !isRequestableProduct(catalogProduct)) {
          return;
        }
        state[id] = {
          labelKey: catalogProduct ? catalogProduct.titleKey : button.getAttribute("data-quote-label-key") || id,
          quantity: quantityForButton(button, id)
        };
        save();
        updateSummary();
      });
    });

    var reorderForm = document.querySelector("[data-reorder-form]");
    var reorderInput = document.querySelector("[data-reorder-product]");
    var reorderList = document.querySelector("[data-reorder-products]");
    var reorderQuantity = document.querySelector("[data-reorder-quantity]");
    var reorderStatus = document.querySelector("[data-reorder-status]");
    var reorderValues = {};

    function normalizeReorderValue(value) {
      return String(value || "").trim().toLocaleLowerCase();
    }

    function renderReorderProducts() {
      if (!reorderList) {
        return;
      }
      reorderValues = {};
      reorderList.textContent = "";
      Object.keys(BOUTIQUE_CATALOG).forEach(function (id) {
        var product = BOUTIQUE_CATALOG[id];
        if (!isRequestableProduct(product)) {
          return;
        }
        var display = translate(product.titleKey);
        var option = document.createElement("option");
        option.value = display;
        reorderList.appendChild(option);
        reorderValues[normalizeReorderValue(display)] = id;
        reorderValues[normalizeReorderValue(translate(product.titleKey))] = id;
      });
    }

    if (reorderForm && reorderInput) {
      reorderForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var entered = normalizeReorderValue(reorderInput.value);
        var id = reorderValues[entered];
        if (!id) {
          var matchingKey = Object.keys(BOUTIQUE_CATALOG).find(function (productId) {
            var product = BOUTIQUE_CATALOG[productId];
            return isRequestableProduct(product) && normalizeReorderValue(translate(product.titleKey)).indexOf(entered) !== -1;
          });
          id = matchingKey || "";
        }
        if (!id) {
          if (reorderStatus) {
            reorderStatus.textContent = translate("collection.reorderError");
          }
          return;
        }
        var product = BOUTIQUE_CATALOG[id];
        state[id] = {
          labelKey: product.titleKey,
          quantity: clampQuantity(reorderQuantity ? reorderQuantity.value : 1)
        };
        save();
        updateSummary();
        if (reorderStatus) {
          reorderStatus.textContent = translate("collection.reorderSuccess") + " " + translate(product.titleKey) + ".";
        }
        reorderInput.value = "";
        if (reorderQuantity) {
          reorderQuantity.value = "1";
        }
      });
      renderReorderProducts();
    }

    var openButton = document.querySelector("[data-open-quote]");
    if (openButton && dialog) {
      prepareDialog(dialog);
      if (!dialog.querySelector("[data-quote-payment-note]")) {
        var paymentNote = document.createElement("p");
        paymentNote.className = "form-note";
        paymentNote.setAttribute("data-quote-payment-note", "");
        paymentNote.setAttribute("data-i18n", "contact.formText");
        paymentNote.textContent = translate("contact.formText");
        var quoteActions = dialog.querySelector(".quote-dialog-actions");
        if (quoteActions) {
          quoteActions.parentNode.insertBefore(paymentNote, quoteActions);
        }
      }
      openButton.addEventListener("click", function () {
        renderDialog();
        openAventuraDialog(dialog, openButton);
      });
    }

    var closeButton = document.querySelector("[data-close-quote]");
    if (closeButton && dialog) {
      closeButton.addEventListener("click", function () { closeAventuraDialog(dialog); });
    }

    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          closeAventuraDialog(dialog);
        }
      });
    }

    var clearButton = document.querySelector("[data-clear-quote]");
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        state = {};
        save();
        updateSummary();
        renderDialog();
        if (dialog && dialog.open) {
          closeAventuraDialog(dialog);
        }
      });
    }

    var continueButton = document.querySelector("[data-continue-quote]");
    if (continueButton) {
      continueButton.addEventListener("click", function () {
        if (Object.keys(state).length) {
          window.location.href = quoteUrl();
        }
      });
    }

    document.addEventListener("aventura:language", function () {
      updateSummary();
      renderReorderProducts();
      if (dialog && dialog.open) {
        renderDialog();
      }
    });

    updateSummary();
  }

  function setupPerfumeStoryCards() {
    var dialog = document.querySelector("[data-perfume-story-dialog]");
    if (!dialog) {
      return;
    }

    var image = dialog.querySelector("[data-perfume-story-image]");
    var title = dialog.querySelector("[data-perfume-story-title]");
    var activeTitleKey = "";
    prepareDialog(dialog);

    document.querySelectorAll("[data-perfume-story]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeTitleKey = button.getAttribute("data-story-title-key") || "collection.storyDialogTitle";
        if (image) {
          image.src = button.getAttribute("data-perfume-story") || "";
          image.alt = translate(activeTitleKey) + " — " + translate("collection.storyDialogEyebrow");
        }
        if (title) {
          title.textContent = translate(activeTitleKey);
        }
        openAventuraDialog(dialog, button);
      });
    });

    var closeButton = dialog.querySelector("[data-close-perfume-story]");
    if (closeButton) {
      closeButton.addEventListener("click", function () { closeAventuraDialog(dialog); });
    }

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeAventuraDialog(dialog);
      }
    });

    document.addEventListener("aventura:language", function () {
      if (dialog.open && title && activeTitleKey) {
        title.textContent = translate(activeTitleKey);
        if (image) {
          image.alt = translate(activeTitleKey) + " — " + translate("collection.storyDialogEyebrow");
        }
      }
    });
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
    var allowedTypes = ["experience", "event", "corporate", "service", "other"];
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
      "thobe": "collection.thobeTitle",
      "abaya": "collection.abayaTitle",
      "flower": "collection.flowerTitle",
      "airport-welcome": "collection.airportWelcomeTitle",
      "executive-transport": "collection.executiveTransportTitle",
      "meeting-setup": "collection.meetingSetupTitle",
      "concierge": "collection.conciergeTitle",
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
      "sea": "experiences.seaTitle",
      "desert": "experiences.desertTitle",
      "taif": "experiences.taifTitle",
      "executive-arrival": "corporate.package1Title",
      "leadership-half-day": "corporate.package2Title",
      "team-discovery": "corporate.package3Title",
      "executive-offsite": "corporate.program1Title",
      "vip-delegation": "corporate.program2Title",
      "incentive-day": "corporate.program3Title",
      "team-building": "corporate.program4Title",
      "corporate-experience-day": "corporate.program5Title",
      "private-event": "events.privateTitle",
      "executive-meeting": "events.type1Title",
      "networking-dinner": "events.type2Title",
      "recognition": "events.type3Title",
      "experience-day": "events.type4Title",
      "team-program": "events.teamTitle",
      "international-guests": "events.type6Title"
    };
    Object.keys(BOUTIQUE_CATALOG).forEach(function (id) {
      if (isRequestableProduct(BOUTIQUE_CATALOG[id])) {
        requestKeys[id] = BOUTIQUE_CATALOG[id].titleKey;
      }
    });
    var requestedItem = query.get("request") || query.get("service");
    var requestKey = requestKeys[requestedItem];
    var requestedItems = String(query.get("items") || "").split(",").map(function (part) {
      var pieces = part.split(":");
      var id = pieces[0] || "";
      var quantity = clampQuantity(pieces[1]);
      return requestKeys[id] ? { id: id, key: requestKeys[id], quantity: quantity } : null;
    }).filter(Boolean);
    var messageField = form.querySelector('[name="message"]');

    function applyRequestedItem() {
      if ((!requestKey && !requestedItems.length) || !messageField) {
        return;
      }
      if (!messageField.value || messageField.dataset.autofilled === "true") {
        var selections = [];
        if (requestKey) {
          selections.push(translate(requestKey));
        }
        requestedItems.forEach(function (item) {
          selections.push(translate(item.key) + " × " + item.quantity);
        });
        messageField.value = translate("contact.requestedItems") + ":\n- " + selections.join("\n- ");
        messageField.dataset.autofilled = "true";
      }
    }

    var detailGroups = Array.from(form.querySelectorAll("[data-request-details]"));
    var selectedRequestIds = requestedItems.map(function (item) { return item.id; });
    if (requestedItem) {
      selectedRequestIds.push(requestedItem);
    }

    function updateRequestDetails() {
      detailGroups.forEach(function (group) {
        var groupName = group.getAttribute("data-request-details");
        var showCollection = groupName === "collection" && (typeField && typeField.value === "collection" || requestedItems.length > 0);
        var showService = groupName !== "collection" && selectedRequestIds.indexOf(groupName) !== -1;
        group.hidden = !showCollection && !showService;
      });
    }

    applyRequestedItem();
    updateRequestDetails();
    document.addEventListener("aventura:language", applyRequestedItem);
    if (typeField) {
      typeField.addEventListener("change", updateRequestDetails);
    }
    if (messageField) {
      messageField.addEventListener("input", function () {
        messageField.dataset.autofilled = "false";
      });
    }

    function setupContactWizard() {
      var originalGrid = form.querySelector(":scope > .form-grid");
      var originalActions = form.querySelector(":scope > .form-actions");
      if (!originalGrid || !originalActions) {
        return;
      }

      var progress = document.createElement("ol");
      progress.className = "request-progress";
      progress.setAttribute("aria-label", translate("contact.progressLabel"));
      progress.innerHTML = [1, 2, 3].map(function (number) {
        return '<li data-request-progress="' + number + '"><span>' + number + '</span><strong data-i18n="contact.step' + number + 'Short">Step ' + number + '</strong></li>';
      }).join("");

      var wizard = document.createElement("div");
      wizard.className = "request-wizard";
      var steps = {};

      function createStep(number, titleKey, textKey) {
        var step = document.createElement("section");
        step.className = "request-step";
        step.setAttribute("data-request-step", String(number));
        step.hidden = number !== 1;
        step.innerHTML = '<div class="request-step-heading"><span class="eyebrow" data-i18n="contact.step' + number + 'Short">Step ' + number + '</span><h3 data-i18n="' + titleKey + '">' + translate(titleKey) + '</h3><p data-i18n="' + textKey + '">' + translate(textKey) + '</p></div><div class="form-grid" data-request-step-grid></div>';
        steps[number] = step;
        wizard.appendChild(step);
        return step.querySelector("[data-request-step-grid]");
      }

      var firstGrid = createStep(1, "contact.step1Title", "contact.step1Text");
      var secondGrid = createStep(2, "contact.step2Title", "contact.step2Text");
      var thirdGrid = createStep(3, "contact.step3Title", "contact.step3Text");

      function moveField(name, target) {
        var field = form.querySelector('[name="' + name + '"]');
        var wrapper = field && field.closest(".field");
        if (wrapper) {
          target.appendChild(wrapper);
        }
      }

      ["type", "date", "time", "duration", "guests"].forEach(function (name) { moveField(name, firstGrid); });

      var objectiveField = document.createElement("div");
      objectiveField.className = "field full";
      objectiveField.innerHTML = '<label for="objective" data-i18n="contact.objectiveLabel">What should this plan achieve?</label><select id="objective" name="objective"><option value="" selected data-i18n="contact.objectivePlaceholder">Choose the closest objective</option><option value="relaxation" data-i18n="contact.objectiveRelaxation">Relaxation and private time</option><option value="discovery" data-i18n="contact.objectiveDiscovery">Discover Jeddah and local culture</option><option value="hosting" data-i18n="contact.objectiveHosting">Host guests or a delegation</option><option value="team" data-i18n="contact.objectiveTeam">Connect or reward a team</option><option value="celebration" data-i18n="contact.objectiveCelebration">Celebrate an occasion</option><option value="flexible" data-i18n="contact.objectiveFlexible">I would like Aventura to recommend</option></select>';
      firstGrid.appendChild(objectiveField);

      var addOns = document.createElement("fieldset");
      addOns.className = "request-options full";
      addOns.innerHTML = '<legend data-i18n="contact.addonsLegend">Optional supporting services</legend><p data-i18n="contact.addonsText">Select anything you may need. Aventura will confirm only what fits the program.</p><div class="request-option-grid"><label><input type="checkbox" name="addons" value="transport"><span data-i18n="contact.addonTransport">Private transportation</span></label><label><input type="checkbox" name="addons" value="guide"><span data-i18n="contact.addonGuide">Licensed guide</span></label><label><input type="checkbox" name="addons" value="dining"><span data-i18n="contact.addonDining">Dining arrangements</span></label><label><input type="checkbox" name="addons" value="hospitality"><span data-i18n="contact.addonHospitality">Guest welcome and hospitality</span></label><label><input type="checkbox" name="addons" value="concierge"><span data-i18n="contact.addonConcierge">Concierge support</span></label></div>';
      secondGrid.appendChild(addOns);

      detailGroups.forEach(function (group) { secondGrid.appendChild(group); });
      moveField("message", secondGrid);
      ["name", "company", "phone", "email", "preferredResponse"].forEach(function (name) { moveField(name, thirdGrid); });

      function controls(back, next, submit) {
        var row = document.createElement("div");
        row.className = "request-step-actions full";
        if (back) {
          row.insertAdjacentHTML("beforeend", '<button class="btn btn-outline-dark" type="button" data-request-back data-i18n="contact.backButton">Back</button>');
        }
        if (next) {
          row.insertAdjacentHTML("beforeend", '<button class="btn btn-dark" type="button" data-request-next data-i18n="contact.nextButton">Continue</button>');
        }
        if (submit) {
          row.appendChild(originalActions);
        }
        return row;
      }

      firstGrid.appendChild(controls(false, true, false));
      secondGrid.appendChild(controls(true, true, false));
      thirdGrid.appendChild(controls(true, false, true));

      originalGrid.replaceWith(wizard);
      wizard.parentNode.insertBefore(progress, wizard);

      var success = document.createElement("div");
      success.className = "request-success";
      success.hidden = true;
      success.setAttribute("data-request-success", "");
      success.setAttribute("role", "status");
      success.innerHTML = '<span class="request-success-mark" aria-hidden="true">✓</span><div><strong data-i18n="contact.successTitle">Your request is ready</strong><p data-request-success-text></p><div class="request-success-actions"><a class="text-link" data-request-whatsapp-link target="_blank" rel="noopener" data-i18n="contact.openWhatsappAgain">Open WhatsApp again</a><button class="text-link" type="button" data-copy-request data-i18n="contact.copyRequest">Copy request details</button></div></div>';
      form.appendChild(success);

      var currentStep = 1;
      function showStep(number) {
        currentStep = Math.max(1, Math.min(3, number));
        form.setAttribute("data-current-request-step", String(currentStep));
        Object.keys(steps).forEach(function (key) { steps[key].hidden = Number(key) !== currentStep; });
        progress.querySelectorAll("[data-request-progress]").forEach(function (item) {
          var stepNumber = Number(item.getAttribute("data-request-progress"));
          item.classList.toggle("is-active", stepNumber === currentStep);
          item.classList.toggle("is-complete", stepNumber < currentStep);
          item.setAttribute("aria-current", stepNumber === currentStep ? "step" : "false");
        });
        if (window.AVENTURA_TRACK) {
          window.AVENTURA_TRACK("request_step", { target: String(currentStep), requestType: typeField ? typeField.value : "" });
        }
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      wizard.addEventListener("click", function (event) {
        if (event.target.closest("[data-request-next]")) {
          if (currentStep === 1 && typeField && !typeField.value) {
            var status = form.querySelector("[data-form-status]");
            if (status) {
              status.textContent = translate("contact.stepTypeError");
            }
            typeField.focus();
            return;
          }
          var statusNext = form.querySelector("[data-form-status]");
          if (statusNext) {
            statusNext.textContent = "";
          }
          showStep(currentStep + 1);
        }
        if (event.target.closest("[data-request-back]")) {
          showStep(currentStep - 1);
        }
      });

      form.addEventListener("aventura:request-success", function () {
        showStep(3);
        success.hidden = false;
      });

      form.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && event.target.tagName !== "TEXTAREA" && currentStep < 3) {
          event.preventDefault();
          var next = steps[currentStep].querySelector("[data-request-next]");
          if (next) {
            next.click();
          }
        }
      });

      showStep(1);
    }

    setupContactWizard();
    form.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = translate(element.getAttribute("data-i18n"), currentLanguage);
    });
    var lastRequestMessage = "";

    form.addEventListener("click", function (event) {
      var copyButton = event.target.closest("[data-copy-request]");
      if (!copyButton || !lastRequestMessage) {
        return;
      }
      function confirmCopy() {
        copyButton.textContent = translate("contact.requestCopied");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastRequestMessage).then(confirmCopy).catch(function () {});
      } else {
        var temporary = document.createElement("textarea");
        temporary.value = lastRequestMessage;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        try { document.execCommand("copy"); confirmCopy(); } catch (error) { /* Ignore. */ }
        temporary.remove();
      }
    });

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
          status.classList.remove("is-success");
        }
        return;
      }

      if (status) {
        status.textContent = "";
        status.classList.remove("is-success");
      }

      var selectedType = form.querySelector('[name="type"] option:checked');
      var typeText = selectedType ? selectedType.textContent.trim() : "";
      var requestId = "AVE-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var lines = [
        translate("contact.whatsappIntro"),
        "",
        translate("contact.requestReference") + ": " + requestId,
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

      var objectiveOption = form.querySelector('[name="objective"] option:checked');
      if (objectiveOption && objectiveOption.value) {
        lines.push(translate("contact.objectiveLabel") + ": " + objectiveOption.textContent.trim());
      }

      var addonKeys = {
        transport: "contact.addonTransport",
        guide: "contact.addonGuide",
        dining: "contact.addonDining",
        hospitality: "contact.addonHospitality",
        boutique: "contact.addonBoutique",
        concierge: "contact.addonConcierge"
      };
      var selectedAddons = data.getAll("addons").map(function (value) { return addonKeys[value] ? translate(addonKeys[value]) : value; });
      if (selectedAddons.length) {
        lines.push(translate("contact.addonsLegend") + ": " + selectedAddons.join(", "));
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

      var detailRows = [
        ["deliveryLocation", "contact.deliveryLocationLabel"],
        ["deliveryTime", "contact.deliveryTimeLabel"],
        ["personalization", "contact.personalizationLabel"],
        ["thobeLocation", "contact.serviceLocationLabel"],
        ["thobeCount", "contact.thobeCountLabel"],
        ["thobeVisit", "contact.visitTimeLabel"],
        ["thobeDelivery", "contact.requiredDeliveryLabel"],
        ["thobePreference", "contact.thobePreferenceLabel"],
        ["abayaLocation", "contact.serviceLocationLabel"],
        ["abayaVisit", "contact.contactVisitTimeLabel"],
        ["abayaDelivery", "contact.requiredDeliveryLabel"],
        ["abayaContact", "contact.preferredContactLabel"],
        ["preferredResponse", "contact.preferredContactLabel"],
        ["flowerRecipient", "contact.recipientLabel"],
        ["flowerOccasion", "contact.occasionLabel"],
        ["flowerSize", "contact.flowerSizeLabel"],
        ["flowerColors", "contact.flowerColorsLabel"],
        ["flowerLocation", "contact.deliveryLocationLabel"],
        ["flowerDelivery", "contact.deliveryTimeLabel"],
        ["flowerMessage", "contact.cardMessageLabel"]
      ];

      detailRows.forEach(function (row) {
        var field = form.querySelector('[name="' + row[0] + '"]');
        if (!field || field.closest("[data-request-details]") && field.closest("[data-request-details]").hidden) {
          return;
        }
        var value = String(data.get(row[0]) || "").trim();
        if (field.tagName === "SELECT" && field.value) {
          var selectedOption = field.options[field.selectedIndex];
          value = selectedOption ? selectedOption.textContent.trim() : value;
        }
        if (value) {
          var label = translate(row[1]);
          if (label === row[1] && field.id) {
            var fieldLabel = form.querySelector('label[for="' + field.id + '"]');
            label = fieldLabel ? fieldLabel.textContent.trim() : row[0];
          }
          lines.push(label + ": " + value);
        }
      });

      lastRequestMessage = lines.join("\n");
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lastRequestMessage);
      var success = form.querySelector("[data-request-success]");
      var successText = form.querySelector("[data-request-success-text]");
      var whatsappLink = form.querySelector("[data-request-whatsapp-link]");
      if (successText) {
        successText.textContent = translate("contact.successText") + " " + requestId + ".";
      }
      if (whatsappLink) {
        whatsappLink.href = url;
      }
      if (success) {
        success.hidden = false;
      }
      if (status) {
        status.textContent = translate("contact.successStatus") + " " + requestId + ".";
        status.classList.add("is-success");
      }
      if (window.AVENTURA_TRACK) {
        window.AVENTURA_TRACK("request_ready", { requestId: requestId, requestType: typeField ? typeField.value : "" });
      }
      form.dispatchEvent(new CustomEvent("aventura:request-success"));
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
          status.classList.remove("is-success");
        }
        return;
      }

      if (status) {
        status.textContent = "";
        status.classList.remove("is-success");
      }

      var typeKey = partnerType === "organization" ? "partners.typeOrgTitle" : "partners.typeProTitle";
      var categoryOption = form.querySelector('[name="category"] option:checked');
      var categoryText = categoryOption ? categoryOption.textContent.trim() : category;
      var requestId = "COL-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var lines = [
        translate("partners.whatsappIntro"),
        "",
        translate("contact.requestReference") + ": " + requestId,
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
      if (status) {
        status.textContent = translate("partners.successStatus") + " " + requestId + ".";
        status.classList.add("is-success");
      }
      if (window.AVENTURA_TRACK) {
        window.AVENTURA_TRACK("partner_request_ready", { requestId: requestId, requestType: partnerType });
      }
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
    setupExperienceDetail();
    setupPerfumeStoryCards();
    arrangeBoutiqueSections();
    removeUnsupportedBoutiqueItems();
    setupBoutiqueCatalog();
    applyLanguage(getInitialLanguage(), false);
    setupHeader();
    setupBoutiqueFilters();
    setupBoutiqueQuoteSelection();
    setupScentLabInterest();
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

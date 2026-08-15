(function () {
  "use strict";

  /*
   * AVENTURA launch QA fixes run before app.js on every public page.
   * Keep these compatibility fixes here until the next source consolidation.
   */
  function patchLaunchCopy() {
    var dictionaries = window.AVENTURA_I18N || {};

    function setCopy(lang, key, value) {
      if (dictionaries[lang]) dictionaries[lang][key] = value;
    }

    /* Arabic: grammar, address consistency and natural editorial phrasing. */
    setCopy("ar", "cta.description", "شاركنا المناسبة وعدد الضيوف والتاريخ المناسب، وسنصمم اتجاهًا واضحًا يناسب أولوياتك.");
    setCopy("ar", "home.expDescription", "أربعة عوالم خاصة، يُصمَّم كلٌ منها حول ضيوفك ووقتك ونوع اليوم الذي ترغب في صنعه.");
    setCopy("ar", "common.plan", "اطلب عرضًا مخصصًا");
    setCopy("ar", "common.request", "اطلب عرضًا مخصصًا");
    setCopy("ar", "cta.button", "اطلب عرضًا مخصصًا");
    setCopy("ar", "home.heroSecondary", "اطلب عرضًا مخصصًا");
    setCopy("ar", "home.processButton", "اطلب عرضًا مخصصًا");
    setCopy("ar", "experiences.desertTag1", "الكثبان الرملية والغروب");
    setCopy("ar", "services.s1Text", "جداول وحجوزات واقتراحات وترتيبات خاصة تتناسب مع احتياجات الضيف.");
    setCopy("ar", "services.s2Text", "تنسيق الوصول والانتقال بسلاسة من المطار إلى المركبة ثم مقر الإقامة.");
    setCopy("ar", "contact.formText", "لا يتم تحصيل أي مبلغ ولا يُؤكَّد أي حجز هنا؛ هذا النموذج يبدأ محادثة التخطيط وطلب عرض السعر فقط.");
    setCopy("ar", "collection.pathProductEyebrow", "للعميل العائد أو البحث المباشر");
    setCopy("ar", "collection.gatewayDesertText", "تصور عطري للدفء الجاف للرمال والنفحة المعدنية والضوء الأخير فوق الكثبان.");
    setCopy("ar", "guest.step1Text", "أخبرنا بمن ستُقدَّم له الخدمة، وأين يحتاجها، وما الموعد المفضل.");
    setCopy("ar", "corporate.program4Title", "أنشطة خفيفة لبناء الفريق");
    setCopy("ar", "corporate.program6Title", "لقاءات العلاقات والعشاء التنفيذي");
    setCopy("ar", "experiences.offerGrandText", "يخت واسع للمجموعات الخاصة، ويشمل أساسيات اليوم البحري نفسها.");
    setCopy("ar", "experiences.grandRate", "يُعد عرض سعر مخصصًا لليخت الخاص والبرنامج المختار.");

    /* English: replace technically understandable but non-native launch copy. */
    setCopy("en", "corporate.program4Title", "Practical team-building");
    setCopy("en", "experiences.heritageStandardMeta", "Round-trip hotel transport · 1–4 guests");
    setCopy("en", "experiences.heritageVipMeta", "VIP round-trip transport · Up to 6 guests");
    setCopy("en", "experiences.booking2Title", "Payment, changes and cancellations");
    setCopy("en", "experiences.booking2Text", "Payment terms and policies for changes, cancellations or refunds are confirmed in writing for each service.");
    setCopy("en", "events.type4Text", "Established destinations adapted for company groups, with guest comfort and logistics coordinated throughout.");
    setCopy("en", "events.type5Text", "Activities matched to the team's goals, group profile and available time.");
    setCopy("en", "services.s1Text", "Itineraries, reservations, recommendations and special arrangements aligned with the guest's needs.");
    setCopy("en", "about.storyText3", "We design private experiences that bring together culture, the sea, history and the desert, alongside events created with the same attention to depth and detail.");

    /* Spanish: one consistent tú register, natural phrasing and one country style. */
    setCopy("es", "home.expDescription", "Cuatro mundos privados, cada uno diseñado en torno a tus invitados, tu tiempo y el tipo de día que quieres crear.");
    setCopy("es", "journey.bayadah.title", "Bayadah es el destino; el día entero es tuyo");
    setCopy("es", "corporate.program4Title", "Dinámicas prácticas de equipo");
    setCopy("es", "events.type5Title", "Dinámicas de equipo");
    setCopy("es", "events.step1Title", "Definición inicial");
    setCopy("es", "services.s2Text", "Coordinación de la llegada y transición organizada del aeropuerto al vehículo y al alojamiento.");
    setCopy("es", "collection.thobeText", "El sastre visita al huésped para tomar medidas y elegir el tejido. La entrega puede coordinarse en menos de 24 horas una vez confirmada la disponibilidad.");
    setCopy("es", "contact.errorEmail", "Introduce tu correo electrónico para enviar la solicitud de reserva por correo electrónico.");
    setCopy("es", "experiences.desertItem2", "Zona privada de descanso y hospitalidad");

    function normalizeArabic(value) {
      if (typeof value === "string") return value.replace(/اً/g, "ًا");
      if (Array.isArray(value)) return value.map(normalizeArabic);
      if (value && typeof value === "object") {
        Object.keys(value).forEach(function (key) { value[key] = normalizeArabic(value[key]); });
      }
      return value;
    }

    function normalizeSpanish(value) {
      if (typeof value === "string") {
        return value
          .replace(/Arabia Saudita/g, "Arabia Saudí")
          .replace(/vuestro tiempo/g, "tu tiempo")
          .replace(/vuestros invitados/g, "tus invitados")
          .replace(/el día entero es vuestro/g, "el día entero es tuyo")
          .replace(/queréis/g, "quieres");
      }
      if (Array.isArray(value)) return value.map(normalizeSpanish);
      if (value && typeof value === "object") {
        Object.keys(value).forEach(function (key) {
          value[key] = normalizeSpanish(value[key]);
        });
      }
      return value;
    }

    if (dictionaries.ar) normalizeArabic(dictionaries.ar);
    if (dictionaries.es) normalizeSpanish(dictionaries.es);
  }

  patchLaunchCopy();

  function currentDictionary() {
    var lang = (document.documentElement.lang || "ar").toLowerCase();
    var dictionaries = window.AVENTURA_I18N || {};
    return dictionaries[lang] || dictionaries.en || dictionaries.ar || {};
  }

  function textFor(key, fallback) {
    var value = currentDictionary()[key];
    return typeof value === "string" ? value : fallback;
  }

  function upsertMeta(selector, attributes, content) {
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      Object.keys(attributes || {}).forEach(function (name) {
        node.setAttribute(name, attributes[name]);
      });
      document.head.appendChild(node);
    }
    node.setAttribute("content", content || "");
    return node;
  }

  function seoLanguage() {
    var lang = (document.documentElement.lang || "ar").toLowerCase();
    return ["ar", "en", "es"].indexOf(lang) !== -1 ? lang : "ar";
  }

  function seoPath() {
    var path = window.location.pathname || "/";
    if (/\/index\.html$/i.test(path)) path = path.replace(/index\.html$/i, "");
    if (!path) path = "/";
    return path.charAt(0) === "/" ? path : "/" + path;
  }

  function seoUrlFor(lang, path) {
    var base = "https://aventuraksa.com" + (path || seoPath());
    return lang === "ar" ? base : base + "?lang=" + encodeURIComponent(lang);
  }

  function setCanonicalAndAlternates(lang, path) {
    var canonicalUrl = seoUrlFor(lang, path);
    var canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (node) {
      node.remove();
    });

    [
      ["ar", seoUrlFor("ar", path)],
      ["en", seoUrlFor("en", path)],
      ["es", seoUrlFor("es", path)],
      ["x-default", seoUrlFor("ar", path)]
    ].forEach(function (row) {
      var link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = row[0];
      link.href = row[1];
      document.head.appendChild(link);
    });

    return canonicalUrl;
  }

  function setSeoStructuredData(lang, canonicalUrl, pageTitle, pageDescription) {
    var path = seoPath();
    var isHome = path === "/";
    var graph = [];
    var organizationId = "https://aventuraksa.com/#organization";
    var websiteId = "https://aventuraksa.com/#website";

    graph.push({
      "@type": "Organization",
      "@id": organizationId,
      name: "AVENTURA",
      alternateName: "Aventura KSA",
      url: "https://aventuraksa.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://aventuraksa.com/assets/images/aventura-logo.svg"
      },
      email: "contact@aventuraksa.com",
      telephone: "+966555884854",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jeddah",
        addressCountry: "SA"
      },
      areaServed: {
        "@type": "Country",
        name: "Saudi Arabia"
      }
    });

    if (isHome) {
      graph.push({
        "@type": "WebSite",
        "@id": websiteId,
        url: "https://aventuraksa.com/",
        name: "AVENTURA",
        alternateName: "Aventura KSA",
        publisher: { "@id": organizationId }
      });
    }

    var webPage = {
      "@type": "WebPage",
      "@id": canonicalUrl + "#webpage",
      url: canonicalUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: lang === "ar" ? "ar-SA" : lang,
      about: { "@id": organizationId }
    };

    if (!isHome) {
      var h1 = document.querySelector("main h1");
      var crumbName = h1 && h1.textContent.trim() ? h1.textContent.trim() : pageTitle;
      var breadcrumbId = canonicalUrl + "#breadcrumb";
      var homeUrl = seoUrlFor(lang, "/");
      graph.push({
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: lang === "ar" ? "أفنتورا" : "AVENTURA",
            item: homeUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: crumbName,
            item: canonicalUrl
          }
        ]
      });
      webPage.breadcrumb = { "@id": breadcrumbId };
    } else {
      webPage.isPartOf = { "@id": websiteId };
    }

    graph.push(webPage);

    var schema = document.head.querySelector('script[data-aventura-seo-schema]');
    if (!schema) {
      schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.setAttribute("data-aventura-seo-schema", "true");
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }

  function applySeoEnhancements() {
    if (!document.body) return;

    var lang = seoLanguage();
    var dictionary = currentDictionary();
    var titleKey = document.body.getAttribute("data-title-key") || "";
    var descriptionKey = document.body.getAttribute("data-description-key") || "";
    var translatedTitle = titleKey && typeof dictionary[titleKey] === "string" ? dictionary[titleKey].trim() : "";
    var translatedDescription = descriptionKey && typeof dictionary[descriptionKey] === "string" ? dictionary[descriptionKey].trim() : "";
    var descriptionMeta = document.head.querySelector('meta[name="description"]');
    var pageTitle = translatedTitle || document.title || "AVENTURA";
    var pageDescription = translatedDescription || (descriptionMeta ? descriptionMeta.getAttribute("content") : "") || "Private experiences, events and guest hospitality in Jeddah and Saudi Arabia.";
    var path = seoPath();
    var canonicalUrl = setCanonicalAndAlternates(lang, path);

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: "description" }, pageDescription);
    upsertMeta('meta[name="robots"]', { name: "robots" }, "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, pageTitle);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, pageDescription);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "AVENTURA");
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, lang === "ar" ? "ar_SA" : (lang === "es" ? "es_ES" : "en_US"));
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, pageTitle);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, pageDescription);

    setSeoStructuredData(lang, canonicalUrl, pageTitle, pageDescription);
  }

  function patchPerfumeStoryPaths() {
    var storyPaths = {
      "perfume-roshan": "assets/images/fragrance-cards/roshan.webp?v=20260815-1",
      "perfume-sea": "assets/images/fragrance-cards/sea-experience.webp?v=20260815-1",
      "perfume-taif": "assets/images/fragrance-cards/taif-experience.webp?v=20260815-1",
      "perfume-noir": "assets/images/fragrance-cards/after-midnight-noir.webp?v=20260815-1",
      "perfume-velvet": "assets/images/fragrance-cards/after-midnight-velvet.webp?v=20260815-1"
    };

    Object.keys(storyPaths).forEach(function (id) {
      var item = document.querySelector('[data-product-id="' + id + '"]');
      var trigger = item && item.querySelector("[data-perfume-story]");
      if (trigger) trigger.setAttribute("data-perfume-story", storyPaths[id]);
    });
  }

  function patchCorporateGuestServicesLink() {
    document.querySelectorAll('a[href="collection.html?experience=corporate"]').forEach(function (link) {
      link.setAttribute("href", "guest-services.html");
    });
  }

  function patchContactRequestTypes() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var typeField = form.querySelector('[name="type"]');
    if (!typeField) return;

    var serviceOption = typeField.querySelector('option[value="service"]');
    if (serviceOption) serviceOption.value = "guest-services";

    var query = new URLSearchParams(window.location.search);
    var requestedType = query.get("type") || "";

    if (requestedType === "collection" && !typeField.querySelector('option[value="collection"]')) {
      var collectionOption = document.createElement("option");
      collectionOption.value = "collection";
      collectionOption.textContent = textFor("nav.collection", "Boutique");
      typeField.appendChild(collectionOption);
    }

    if (requestedType === "service") typeField.value = "guest-services";
    if (requestedType === "collection") typeField.value = "collection";

    if (requestedType === "service" || requestedType === "collection") {
      typeField.dispatchEvent(new Event("change", { bubbles: true }));
      form.dispatchEvent(new CustomEvent("aventura:request-details-updated", { bubbles: true }));
    }
  }

  function addLastLightToBoutique() {
    if (!document.body || document.body.getAttribute("data-page") !== "collection") return;
    if (document.querySelector("[data-qa-last-light]")) return;

    var grid = document.querySelector("#fragrances .perfume-grid");
    if (!grid) return;

    var card = document.createElement("article");
    card.className = "perfume-card perfume-card-with-actions";
    card.setAttribute("data-qa-last-light", "");
    card.setAttribute("data-product-id", "perfume-last-light");
    card.setAttribute("data-boutique-item", "");
    card.setAttribute("data-category", "desert");
    card.setAttribute("data-product-type", "fragrance");
    card.innerHTML = [
      '<div class="perfume-card-media">',
      '  <img src="assets/images/fragrance-cards/last-light.webp?v=20260815-1" width="900" height="1125" loading="eager" decoding="async" alt="Last Light">',
      '  <button class="perfume-story-trigger" type="button" data-qa-last-light-story><span data-qa-last-light-story-label></span></button>',
      '</div>',
      '<div class="perfume-card-copy"><h3 data-qa-last-light-title></h3><p data-qa-last-light-text></p></div>',
      '<span class="status coming" data-qa-last-light-status></span>'
    ].join("");

    var sea = grid.querySelector('[data-product-id="perfume-sea"]');
    if (sea && sea.nextSibling) grid.insertBefore(card, sea.nextSibling);
    else grid.appendChild(card);

    function refreshLastLightCopy() {
      var title = card.querySelector("[data-qa-last-light-title]");
      var description = card.querySelector("[data-qa-last-light-text]");
      var status = card.querySelector("[data-qa-last-light-status]");
      var story = card.querySelector("[data-qa-last-light-story-label]");
      if (title) title.textContent = textFor("collection.p3Title", "Last Light");
      if (description) description.textContent = textFor("collection.p3Text", "Dry woods, warm sand, vetiver and a mineral trace.");
      if (status) status.textContent = textFor("common.comingSoon", "Coming soon");
      if (story) story.textContent = textFor("collection.viewStoryCard", "View story card");
    }

    function boutiqueState() {
      var query = new URLSearchParams(window.location.search);
      var activeExperience = document.querySelector('[data-boutique-filter][aria-pressed="true"]');
      var activeType = document.querySelector('[data-boutique-type][aria-pressed="true"]');
      var search = document.querySelector("[data-boutique-search]");
      return {
        experience: activeExperience ? activeExperience.getAttribute("data-boutique-filter") : (query.get("experience") || "all"),
        type: activeType ? activeType.getAttribute("data-boutique-type") : (query.get("productType") || "all"),
        search: search ? String(search.value || "").trim().toLowerCase() : String(query.get("q") || "").trim().toLowerCase()
      };
    }

    function syncVisibility() {
      var state = boutiqueState();
      var experienceMatches = state.experience === "all" || state.experience === "desert";
      var typeMatches = state.type === "all" || state.type === "fragrance";
      var searchable = (card.textContent || "").toLowerCase();
      var searchMatches = !state.search || searchable.indexOf(state.search) !== -1 || "last light".indexOf(state.search) !== -1;
      card.hidden = !(experienceMatches && typeMatches && searchMatches);

      var section = document.getElementById("fragrances");
      if (section) {
        var existingItems = Array.from(section.querySelectorAll("[data-boutique-item]"));
        var existingVisible = existingItems.some(function (item) { return !item.hidden; });
        section.hidden = card.hidden && !existingVisible;
      }
      var empty = document.querySelector("[data-boutique-empty]");
      if (empty && !card.hidden) empty.hidden = true;
    }

    var storyButton = card.querySelector("[data-qa-last-light-story]");
    if (storyButton) {
      storyButton.addEventListener("click", function () {
        var dialog = document.querySelector("[data-perfume-story-dialog]");
        if (!dialog) return;
        var image = dialog.querySelector("[data-perfume-story-image]");
        var title = dialog.querySelector("[data-perfume-story-title]");
        if (image) {
          image.src = "assets/images/fragrance-cards/last-light.webp?v=20260815-1";
          image.alt = textFor("collection.p3Title", "Last Light");
        }
        if (title) title.textContent = textFor("collection.p3Title", "Last Light");
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    }

    document.querySelectorAll('[data-boutique-gateway][data-collection="desert"]').forEach(function (link) {
      link.setAttribute("href", "collection.html?experience=desert#fragrances");
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-boutique-filter], [data-boutique-type], [data-clear-boutique-filters]")) {
        window.setTimeout(syncVisibility, 0);
      }
    });
    var search = document.querySelector("[data-boutique-search]");
    if (search) search.addEventListener("input", function () { window.setTimeout(syncVisibility, 0); });
    document.addEventListener("aventura:language", function () {
      refreshLastLightCopy();
      window.setTimeout(syncVisibility, 0);
    });

    refreshLastLightCopy();
    syncVisibility();
  }

  function addBoutiqueFragranceCtas() {
    if (!document.body || document.body.getAttribute("data-page") !== "collection") return;
    var destinations = {
      "perfume-sea": "experience-sea.html#aventura-fragrances",
      "perfume-roshan": "experience-historic-jeddah.html#aventura-fragrances",
      "perfume-last-light": "experience-desert.html#aventura-fragrances",
      "perfume-taif": "experience-taif.html#aventura-fragrances",
      "perfume-noir": "experience-jeddah-day.html#aventura-fragrances",
      "perfume-velvet": "experience-jeddah-day.html#aventura-fragrances"
    };
    document.querySelectorAll('.perfume-card[data-product-id]').forEach(function (card) {
      var existing = card.querySelector('[data-boutique-fragrance-interest]');
      if (existing) {
        existing.textContent = textFor('collection.interestJourneyButton', 'Explore fragrance & register interest');
        return;
      }
      var id = card.getAttribute('data-product-id');
      if (!destinations[id]) return;
      var action = document.createElement('a');
      action.className = 'perfume-interest-button';
      action.href = destinations[id];
      action.setAttribute('data-boutique-fragrance-interest', id);
      action.textContent = textFor('collection.interestJourneyButton', 'Explore fragrance & register interest');
      action.addEventListener('click', function () {
        event('product_interest_click', { product_id: id, source: 'boutique', page_language: document.documentElement.lang || '' });
      });
      var copy = card.querySelector('.perfume-card-copy');
      if (copy) copy.appendChild(action);
    });
  }

  function normalizeRenderedSpanish() {
    if ((document.documentElement.lang || "").toLowerCase() !== "es") return;
    var replacements = {
      "¿Cómo prefieren la experiencia del desierto?": "¿Cómo prefieres la experiencia del desierto?",
      "¿Desean una sesión privada de hospitalidad?": "¿Deseas una sesión privada de hospitalidad?"
    };

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var trimmed = String(node.nodeValue || "").trim();
      if (replacements[trimmed]) node.nodeValue = node.nodeValue.replace(trimmed, replacements[trimmed]);
    }
  }

  function runPostAppLaunchFixes() {
    patchPerfumeStoryPaths();
    patchCorporateGuestServicesLink();
    patchContactRequestTypes();
    addLastLightToBoutique();
    addBoutiqueFragranceCtas();
    normalizeRenderedSpanish();
    applySeoEnhancements();
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(runPostAppLaunchFixes, 0);
  }, { once: true });

  document.addEventListener("aventura:language", function () {
    window.setTimeout(function () {
      patchLaunchCopy();
      patchPerfumeStoryPaths();
      addBoutiqueFragranceCtas();
      normalizeRenderedSpanish();
      applySeoEnhancements();
    }, 0);
  });

  // Optional GA4 analytics. The tag is not loaded until the visitor agrees.
  var MEASUREMENT_ID = "G-MC0GBSTCRT";
  var ANALYTICS_CONSENT_KEY = "aventura_analytics_consent_v1";
  var analyticsEnabled = false;
  var analyticsInitialized = false;
  var analyticsBanner = null;
  var analyticsCopy = {
    ar: {
      title: "تحليلات اختيارية",
      text: "نستخدم Google Analytics 4 لفهم استخدام الموقع وتحسينه. لا نرسل الاسم أو البريد أو رقم الجوال أو محتوى الطلبات إلى التحليلات.",
      accept: "السماح بالتحليلات",
      reject: "الأساسية فقط",
      policy: "سياسة الخصوصية"
    },
    en: {
      title: "Optional analytics",
      text: "We use Google Analytics 4 to understand and improve use of the website. We do not send names, email addresses, phone numbers or request content to analytics.",
      accept: "Allow analytics",
      reject: "Essential only",
      policy: "Privacy policy"
    },
    es: {
      title: "Analítica opcional",
      text: "Usamos Google Analytics 4 para comprender y mejorar el uso del sitio. No enviamos nombres, correos, teléfonos ni contenido de solicitudes a la analítica.",
      accept: "Permitir analítica",
      reject: "Solo esenciales",
      policy: "Política de privacidad"
    }
  };

  function analyticsLanguage() {
    var lang = (document.documentElement.lang || "ar").toLowerCase();
    return analyticsCopy[lang] ? lang : "ar";
  }

  function readAnalyticsConsent() {
    try {
      var value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : "";
    } catch (error) {
      return "";
    }
  }

  function writeAnalyticsConsent(value) {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch (error) {
      /* A visitor can still make a session choice when storage is unavailable. */
    }
  }

  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (entry) {
      var name = String(entry || "").split("=")[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      document.cookie = name + "=; Max-Age=0; path=/";
      document.cookie = name + "=; Max-Age=0; path=/; domain=" + location.hostname;
      document.cookie = name + "=; Max-Age=0; path=/; domain=." + location.hostname;
    });
  }

  function initializeAnalytics() {
    if (analyticsInitialized) {
      analyticsEnabled = true;
      window["ga-disable-" + MEASUREMENT_ID] = false;
      return;
    }
    analyticsInitialized = true;
    analyticsEnabled = true;
    window["ga-disable-" + MEASUREMENT_ID] = false;
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
  }

  function removeAnalyticsBanner() {
    if (analyticsBanner && analyticsBanner.parentNode) analyticsBanner.parentNode.removeChild(analyticsBanner);
    analyticsBanner = null;
  }

  function addAnalyticsConsentStyles() {
    if (document.getElementById("aventura-analytics-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "aventura-analytics-consent-styles";
    style.textContent = ".aventura-analytics-consent{position:fixed;z-index:9999;inset-inline:18px;bottom:18px;max-width:720px;margin-inline:auto;padding:18px;border:1px solid rgba(10,42,67,.18);border-radius:18px;background:#fffdf8;color:#0a2a43;box-shadow:0 18px 54px rgba(4,18,30,.22)}.aventura-analytics-consent h2{margin:0;font-size:1.08rem}.aventura-analytics-consent p{margin:.55rem 0 0;line-height:1.55}.aventura-analytics-consent a{color:#0a2a43;font-weight:700}.aventura-analytics-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.aventura-analytics-actions button{min-height:42px;padding:0 16px;border-radius:999px;border:1px solid #0a2a43;background:#0a2a43;color:#fff;font:inherit;font-weight:700;cursor:pointer}.aventura-analytics-actions .is-secondary{background:transparent;color:#0a2a43}@media(max-width:560px){.aventura-analytics-consent{inset-inline:12px;bottom:12px;padding:16px}.aventura-analytics-actions{display:grid;grid-template-columns:1fr}.aventura-analytics-actions button{width:100%}}";
    document.head.appendChild(style);
  }

  function createAnalyticsElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function showAnalyticsChoices() {
    if (!document.body || analyticsBanner) return;
    var current = analyticsCopy[analyticsLanguage()];
    addAnalyticsConsentStyles();
    analyticsBanner = createAnalyticsElement("aside", "aventura-analytics-consent");
    analyticsBanner.setAttribute("role", "region");
    analyticsBanner.setAttribute("aria-label", current.title);
    analyticsBanner.appendChild(createAnalyticsElement("h2", "", current.title));
    analyticsBanner.appendChild(createAnalyticsElement("p", "", current.text));
    var policy = document.createElement("a");
    policy.href = "privacy.html";
    policy.textContent = current.policy;
    var policyWrap = createAnalyticsElement("p", "");
    policyWrap.appendChild(policy);
    analyticsBanner.appendChild(policyWrap);
    var actions = createAnalyticsElement("div", "aventura-analytics-actions");
    var accept = createAnalyticsElement("button", "", current.accept);
    var reject = createAnalyticsElement("button", "is-secondary", current.reject);
    accept.type = "button";
    reject.type = "button";
    accept.addEventListener("click", function () {
      writeAnalyticsConsent("granted");
      removeAnalyticsBanner();
      initializeAnalytics();
    });
    reject.addEventListener("click", function () {
      writeAnalyticsConsent("denied");
      window["ga-disable-" + MEASUREMENT_ID] = true;
      clearAnalyticsCookies();
      removeAnalyticsBanner();
    });
    actions.appendChild(accept);
    actions.appendChild(reject);
    analyticsBanner.appendChild(actions);
    document.body.appendChild(analyticsBanner);
  }

  function openAnalyticsPreferences() {
    window["ga-disable-" + MEASUREMENT_ID] = true;
    analyticsEnabled = false;
    clearAnalyticsCookies();
    writeAnalyticsConsent("");
    removeAnalyticsBanner();
    showAnalyticsChoices();
  }

  window.AVENTURA_ANALYTICS = { openPreferences: openAnalyticsPreferences };
  window.addEventListener("aventura:analytics-preferences", openAnalyticsPreferences);
  document.addEventListener("aventura:language", function () {
    if (!analyticsBanner) return;
    removeAnalyticsBanner();
    showAnalyticsChoices();
  });

  if (readAnalyticsConsent() === "granted") {
    initializeAnalytics();
  } else {
    window["ga-disable-" + MEASUREMENT_ID] = true;
    clearAnalyticsCookies();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showAnalyticsChoices, { once: true });
    else showAnalyticsChoices();
  }

  function event(name, params) {
    if (!analyticsEnabled || typeof window.gtag !== "function") return;
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

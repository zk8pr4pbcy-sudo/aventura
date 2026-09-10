(function (root) {
  "use strict";

  var DATA_URL = "data/curated-events.json";
  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com";
  var SAUDI_TIME_ZONE = "Asia/Riyadh";
  var LANGUAGES = ["ar", "en", "es"];
  var LOCALES = { ar: "ar-SA", en: "en-GB", es: "es-ES" };

  var COPY = {
    ar: {
      metaTitle: "نسّق تجربتك حول الفعالية | أفنتورا",
      metaDescription: "نموذج مختصر لتنسيق خدمات أفنتورا حول فعالية مختارة في جدة.",
      back: "← العودة إلى مختارات جدة",
      title: "نسّق تجربتك حول الفعالية",
      intro: "الفعالية محددة بالفعل. أخبرنا فقط عن ضيوفك والخدمات التي تريدها، وسنرتب التفاصيل حول موعدها.",
      loading: "جارٍ تجهيز تفاصيل الفعالية…",
      unavailableTitle: "هذه الفعالية غير متاحة للطلب الآن",
      unavailableText: "قد تكون الفعالية انتهت أو لم تعد ضمن مختارات أفنتورا الحالية.",
      browseEvents: "عرض مختارات جدة",
      aventuraSuggests: "اقتراح أفنتورا",
      source: "مصدر الفعالية ↗",
      independence: "أفنتورا جهة مستقلة وتنسّق الخدمات المحيطة بالفعالية، وليست الجهة المنظمة أو بائع التذاكر ما لم يُذكر خلاف ذلك.",
      shortForm: "طلب مختصر",
      formTitle: "ما الذي تريد أن ننسّقه؟",
      formText: "لا يوجد دفع هنا. نستخدم هذه البيانات لإعداد أول تنسيق مناسب والتواصل معك.",
      name: "الاسم",
      namePlaceholder: "الاسم الكامل",
      phone: "الجوال / واتساب",
      phonePlaceholder: "+966 ...",
      company: "الجهة أو الشركة",
      email: "البريد الإلكتروني",
      optionalPlaceholder: "اختياري",
      emailPlaceholder: "name@example.com",
      guests: "عدد الضيوف",
      guestsPlaceholder: "مثال: 4",
      attendanceDate: "يوم حضور الفعالية",
      servicesTitle: "اختر الخدمات المطلوبة",
      servicesHelp: "اختر خدمة واحدة على الأقل. يمكننا دمج أكثر من خدمة في تنسيق واحد.",
      serviceTransport: "تنقل خاص",
      serviceDining: "عشاء أو حجز قبل/بعد الفعالية",
      serviceHistoric: "جولة جدة التاريخية",
      serviceWaterfront: "واجهة جدة أو تجربة بحرية",
      serviceCompanion: "مرافق أو مترجم",
      serviceCustom: "تنسيق خاص حسب الطلب",
      servicesError: "اختر خدمة واحدة على الأقل.",
      pickup: "موقع الاستلام أو الفندق",
      pickupPlaceholder: "مثال: حي الشاطئ أو اسم الفندق",
      notes: "ملاحظة قصيرة",
      notesPlaceholder: "أي توقيت أو طلب مهم نحتاج نعرفه",
      consentPrefix: "أوافق على معالجة بياناتي لغرض مراجعة طلبي والتواصل معي وفق ",
      consentLink: "سياسة الخصوصية",
      consentSuffix: ".",
      submit: "أرسل طلب تنسيق التجربة",
      sending: "جارٍ إرسال الطلب…",
      responseNote: "يراجع فريق أفنتورا الطلب ثم يتواصل معك لتأكيد التوفر والتفاصيل.",
      successTitle: "تم استلام طلبك",
      successText: "وصل طلب تنسيق الفعالية إلى أفنتورا. سنراجع التوفر والخدمات المطلوبة ثم نتواصل معك.",
      returnHome: "العودة للرئيسية",
      sendError: "تعذر إرسال الطلب الآن. تحقق من الاتصال وحاول مرة أخرى."
    },
    en: {
      metaTitle: "Plan around the event | Aventura",
      metaDescription: "A short request form for Aventura services around a selected Jeddah event.",
      back: "← Back to Jeddah picks",
      title: "Plan your experience around the event",
      intro: "The event is already selected. Tell us who is joining and what you would like us to coordinate around it.",
      loading: "Preparing the event details…",
      unavailableTitle: "This event is not available for requests now",
      unavailableText: "The event may have ended or may no longer be part of Aventura's current selection.",
      browseEvents: "View Jeddah picks",
      aventuraSuggests: "Aventura suggests",
      source: "Event source ↗",
      independence: "Aventura is an independent service provider coordinating services around the event. We are not the organiser or ticket seller unless explicitly stated otherwise.",
      shortForm: "Short request",
      formTitle: "What would you like us to coordinate?",
      formText: "No payment is taken here. We use these details to prepare an initial direction and contact you.",
      name: "Name",
      namePlaceholder: "Full name",
      phone: "Mobile / WhatsApp",
      phonePlaceholder: "+966 ...",
      company: "Company or organisation",
      email: "Email",
      optionalPlaceholder: "Optional",
      emailPlaceholder: "name@example.com",
      guests: "Number of guests",
      guestsPlaceholder: "Example: 4",
      attendanceDate: "Event attendance date",
      servicesTitle: "Choose the services you need",
      servicesHelp: "Choose at least one service. We can combine several services into one coordinated plan.",
      serviceTransport: "Private transport",
      serviceDining: "Dinner or reservation before/after the event",
      serviceHistoric: "Historic Jeddah visit",
      serviceWaterfront: "Jeddah waterfront or sea experience",
      serviceCompanion: "Companion or interpreter",
      serviceCustom: "Custom coordination",
      servicesError: "Choose at least one service.",
      pickup: "Pickup area or hotel",
      pickupPlaceholder: "Example: Ash Shati district or hotel name",
      notes: "Short note",
      notesPlaceholder: "Any timing or important request we should know",
      consentPrefix: "I agree that Aventura may process my data to review my request and contact me under the ",
      consentLink: "Privacy Policy",
      consentSuffix: ".",
      submit: "Send coordination request",
      sending: "Sending your request…",
      responseNote: "Aventura reviews the request and then contacts you to confirm availability and details.",
      successTitle: "Your request has been received",
      successText: "Your event coordination request reached Aventura. We will review availability and the requested services, then contact you.",
      returnHome: "Return home",
      sendError: "We could not send the request right now. Check your connection and try again."
    },
    es: {
      metaTitle: "Organiza tu experiencia alrededor del evento | Aventura",
      metaDescription: "Formulario breve para coordinar servicios de Aventura alrededor de un evento seleccionado en Yeda.",
      back: "← Volver a la selección de Yeda",
      title: "Organiza tu experiencia alrededor del evento",
      intro: "El evento ya está seleccionado. Cuéntanos quién te acompaña y qué servicios quieres que coordinemos.",
      loading: "Preparando los detalles del evento…",
      unavailableTitle: "Este evento no está disponible para solicitudes ahora",
      unavailableText: "El evento puede haber finalizado o ya no formar parte de la selección actual de Aventura.",
      browseEvents: "Ver selección de Yeda",
      aventuraSuggests: "Aventura propone",
      source: "Fuente del evento ↗",
      independence: "Aventura es un proveedor independiente que coordina servicios alrededor del evento. No somos el organizador ni el vendedor de entradas salvo que se indique expresamente lo contrario.",
      shortForm: "Solicitud breve",
      formTitle: "¿Qué quieres que coordinemos?",
      formText: "Aquí no se realiza ningún pago. Usamos estos datos para preparar una primera propuesta y contactarte.",
      name: "Nombre",
      namePlaceholder: "Nombre completo",
      phone: "Móvil / WhatsApp",
      phonePlaceholder: "+966 ...",
      company: "Empresa u organización",
      email: "Correo electrónico",
      optionalPlaceholder: "Opcional",
      emailPlaceholder: "name@example.com",
      guests: "Número de invitados",
      guestsPlaceholder: "Ejemplo: 4",
      attendanceDate: "Fecha de asistencia al evento",
      servicesTitle: "Elige los servicios que necesitas",
      servicesHelp: "Elige al menos un servicio. Podemos combinar varios servicios en una sola coordinación.",
      serviceTransport: "Transporte privado",
      serviceDining: "Cena o reserva antes/después del evento",
      serviceHistoric: "Visita a Yeda Histórica",
      serviceWaterfront: "Paseo marítimo de Yeda o experiencia en el mar",
      serviceCompanion: "Acompañante o intérprete",
      serviceCustom: "Coordinación personalizada",
      servicesError: "Elige al menos un servicio.",
      pickup: "Zona de recogida u hotel",
      pickupPlaceholder: "Ejemplo: distrito Ash Shati o nombre del hotel",
      notes: "Nota breve",
      notesPlaceholder: "Cualquier horario o petición importante que debamos saber",
      consentPrefix: "Acepto que Aventura trate mis datos para revisar mi solicitud y ponerse en contacto conmigo conforme a la ",
      consentLink: "Política de privacidad",
      consentSuffix: ".",
      submit: "Enviar solicitud de coordinación",
      sending: "Enviando tu solicitud…",
      responseNote: "Aventura revisará la solicitud y después se pondrá en contacto contigo para confirmar disponibilidad y detalles.",
      successTitle: "Hemos recibido tu solicitud",
      successText: "Tu solicitud de coordinación del evento ha llegado a Aventura. Revisaremos la disponibilidad y los servicios solicitados y nos pondremos en contacto contigo.",
      returnHome: "Volver al inicio",
      sendError: "No pudimos enviar la solicitud ahora. Comprueba tu conexión e inténtalo de nuevo."
    }
  };

  var SERVICE_KEYS = {
    private_transport: "serviceTransport",
    dining: "serviceDining",
    historic_jeddah: "serviceHistoric",
    waterfront: "serviceWaterfront",
    companion_interpreter: "serviceCompanion",
    custom: "serviceCustom"
  };

  function normalizeLanguage(value) {
    var lang = String(value || "").toLowerCase();
    return LANGUAGES.indexOf(lang) !== -1 ? lang : "ar";
  }

  function currentLanguage() {
    if (typeof document === "undefined") return "ar";
    return normalizeLanguage(document.documentElement.lang);
  }

  function localized(value, lang) {
    if (value && typeof value === "object") return value[lang] || value.ar || value.en || value.es || "";
    return String(value || "");
  }

  function saudiToday(date) {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: SAUDI_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date || new Date());
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    return values.year + "-" + values.month + "-" + values.day;
  }

  function dateObject(isoDate) {
    return new Date(isoDate + "T12:00:00Z");
  }

  function formatDateRange(event, lang) {
    if (!event || !event.startDate || !event.endDate) return "";
    var locale = LOCALES[lang] || LOCALES.ar;
    var options = { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" };
    if (event.startDate === event.endDate) return new Intl.DateTimeFormat(locale, options).format(dateObject(event.startDate));
    return new Intl.DateTimeFormat(locale, options).format(dateObject(event.startDate)) + " – " +
      new Intl.DateTimeFormat(locale, options).format(dateObject(event.endDate));
  }

  function findEvent(events, eventId) {
    return (events || []).find(function (event) {
      return event && event.active !== false && event.id === eventId;
    }) || null;
  }

  function isRequestable(event, today) {
    return Boolean(event && event.active !== false && event.endDate && event.endDate >= (today || saudiToday()));
  }

  function setText(rootElement, lang) {
    var copy = COPY[lang] || COPY.ar;
    rootElement.querySelectorAll("[data-event-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-event-i18n");
      if (copy[key]) element.textContent = copy[key];
    });
    rootElement.querySelectorAll("[data-event-placeholder]").forEach(function (element) {
      var key = element.getAttribute("data-event-placeholder");
      if (copy[key]) element.setAttribute("placeholder", copy[key]);
    });

    var consent = rootElement.querySelector("[data-event-consent-text]");
    if (consent) {
      consent.replaceChildren();
      consent.append(document.createTextNode(copy.consentPrefix));
      var link = document.createElement("a");
      link.href = "privacy.html";
      link.textContent = copy.consentLink;
      consent.appendChild(link);
      consent.append(document.createTextNode(copy.consentSuffix));
    }

    document.title = copy.metaTitle;
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", copy.metaDescription);
  }

  function renderEvent(rootElement, event, lang) {
    var image = rootElement.querySelector("[data-event-image]");
    if (image) {
      image.src = event.image || "assets/images/hero-jeddah.webp";
      image.alt = localized(event.imageAlt, lang);
    }
    var title = rootElement.querySelector("[data-event-title]");
    if (title) title.textContent = localized(event.title, lang);
    var category = rootElement.querySelector("[data-event-category]");
    if (category) category.textContent = localized(event.category, lang);
    var location = rootElement.querySelector("[data-event-location]");
    if (location) location.textContent = localized(event.location, lang);
    var date = rootElement.querySelector("[data-event-date]");
    if (date) date.textContent = formatDateRange(event, lang);
    var plan = rootElement.querySelector("[data-event-plan]");
    if (plan) plan.textContent = localized(event.aventuraPlan, lang);
    var source = rootElement.querySelector("[data-event-source]");
    if (source) source.href = event.sourceUrl || "#";

    var attendanceDate = rootElement.querySelector("#eventRequestDate");
    if (attendanceDate) {
      var today = saudiToday();
      attendanceDate.min = event.startDate > today ? event.startDate : today;
      attendanceDate.max = event.endDate;
      if (!attendanceDate.value || attendanceDate.value < attendanceDate.min || attendanceDate.value > attendanceDate.max) {
        attendanceDate.value = attendanceDate.min <= attendanceDate.max ? attendanceDate.min : event.endDate;
      }
    }
  }

  function setHidden(form, name, value) {
    var input = form.querySelector('[name="' + name + '"]');
    if (input) input.value = value == null ? "" : String(value);
  }

  function selectedServices(form) {
    return Array.prototype.slice.call(form.querySelectorAll("[data-event-services] input[type='checkbox']:checked"))
      .map(function (input) { return input.value; })
      .filter(Boolean);
  }

  function serviceLabels(codes, lang) {
    var copy = COPY[lang] || COPY.ar;
    return codes.map(function (code) {
      return copy[SERVICE_KEYS[code]] || code;
    });
  }

  function validateServices(form, lang) {
    var codes = selectedServices(form);
    var group = form.querySelector("[data-event-services]");
    var error = form.querySelector("[data-event-service-error]");
    var valid = codes.length > 0;
    if (group) group.setAttribute("aria-invalid", valid ? "false" : "true");
    if (error) {
      error.hidden = valid;
      error.textContent = (COPY[lang] || COPY.ar).servicesError;
    }
    return valid;
  }

  function preparePayload(form, event, lang) {
    var codes = selectedServices(form);
    var email = form.querySelector('[name="email"]');
    setHidden(form, "_subject", "Aventura curated event request — " + localized(event.title, "en"));
    setHidden(form, "_replyto", email ? email.value.trim() : "");
    setHidden(form, "_url", window.location.href);
    setHidden(form, "request_language", lang);
    setHidden(form, "event_id", event.id);
    setHidden(form, "event_title", localized(event.title, lang));
    setHidden(form, "event_start_date", event.startDate);
    setHidden(form, "event_end_date", event.endDate);
    setHidden(form, "event_source_url", event.sourceUrl || "");
    setHidden(form, "selected_services", serviceLabels(codes, lang).join(" | "));
    setHidden(form, "service_codes", codes.join(","));
    setHidden(form, "privacy_consent_at", new Date().toISOString());
    return new FormData(form);
  }

  function setFormStatus(form, message, isError) {
    var status = form.querySelector("[data-event-status]");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function wireForm(rootElement, form, event) {
    form.addEventListener("change", function (eventObject) {
      if (eventObject.target && eventObject.target.matches("[data-event-services] input[type='checkbox']")) {
        validateServices(form, currentLanguage());
      }
    });

    form.addEventListener("submit", function (submitEvent) {
      var lang = currentLanguage();
      var copy = COPY[lang] || COPY.ar;
      var serviceValid = validateServices(form, lang);
      if (!form.checkValidity() || !serviceValid) {
        submitEvent.preventDefault();
        form.reportValidity();
        if (!serviceValid) {
          var firstService = form.querySelector("[data-event-services] input[type='checkbox']");
          if (firstService) firstService.focus();
        }
        return;
      }

      var payload = preparePayload(form, event, lang);
      if (!window.fetch) return;

      submitEvent.preventDefault();
      form.setAttribute("aria-busy", "true");
      var button = form.querySelector("[data-event-submit]");
      if (button) button.disabled = true;
      setFormStatus(form, copy.sending, false);

      window.fetch(FORM_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok || body.success === false || body.success === "false") throw new Error("FormSubmit rejected request");
          return body;
        });
      }).then(function () {
        form.hidden = true;
        var success = rootElement.querySelector("[data-event-success]");
        if (success) success.hidden = false;
        if (typeof window.gtag === "function") {
          window.gtag("event", "curated_event_request_submit", {
            event_id: event.id,
            event_category: "curated_calendar"
          });
        }
      }).catch(function () {
        form.setAttribute("aria-busy", "false");
        if (button) button.disabled = false;
        setFormStatus(form, copy.sendError, true);
      });
    });
  }

  function showUnavailable(rootElement) {
    var loading = rootElement.querySelector("[data-event-loading]");
    var shell = rootElement.querySelector("[data-event-shell]");
    var error = rootElement.querySelector("[data-event-error]");
    if (loading) loading.hidden = true;
    if (shell) shell.hidden = true;
    if (error) error.hidden = false;
  }

  async function init() {
    var rootElement = document.querySelector(".event-request-page");
    if (!rootElement) return;

    setText(rootElement, currentLanguage());
    var eventId = new URLSearchParams(window.location.search).get("event") || "";
    if (!eventId) {
      showUnavailable(rootElement);
      return;
    }

    try {
      var response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Event data request failed: " + response.status);
      var data = await response.json();
      var event = findEvent(data.events, eventId);
      if (!isRequestable(event)) {
        showUnavailable(rootElement);
        return;
      }

      var form = rootElement.querySelector("[data-event-request-form]");
      renderEvent(rootElement, event, currentLanguage());
      if (form) wireForm(rootElement, form, event);

      var loading = rootElement.querySelector("[data-event-loading]");
      var shell = rootElement.querySelector("[data-event-shell]");
      if (loading) loading.hidden = true;
      if (shell) shell.hidden = false;

      var observer = new MutationObserver(function (mutations) {
        if (!mutations.some(function (mutation) { return mutation.attributeName === "lang"; })) return;
        var lang = currentLanguage();
        setText(rootElement, lang);
        renderEvent(rootElement, event, lang);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (error) {
      console.warn("Aventura event request is unavailable.", error);
      showUnavailable(rootElement);
    }
  }

  root.AVENTURA_EVENT_REQUEST = Object.freeze({
    version: "1.0.0",
    saudiToday: saudiToday,
    findEvent: findEvent,
    isRequestable: isRequestable,
    formatDateRange: formatDateRange
  });

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
}(typeof window !== "undefined" ? window : globalThis));

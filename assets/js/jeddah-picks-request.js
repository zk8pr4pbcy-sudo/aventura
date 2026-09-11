(function (root) {
  "use strict";

  var DATA_URL = "data/curated-events.json";
  var ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com";
  var LANGS = ["ar", "en", "es"];
  var LOCALES = { ar: "ar-SA", en: "en-GB", es: "es-ES" };
  var SAUDI_TZ = "Asia/Riyadh";

  var COPY = {
    ar: {
      back: "← العودة إلى المختارات",
      title: "نسّق تجربتك حول الفعالية",
      intro: "الفعالية محددة بالفعل. أخبرنا فقط عن ضيوفك والخدمات المطلوبة وسنرتب التفاصيل حول توقيتها.",
      unavailableTitle: "هذه الفعالية غير متاحة للطلب الآن",
      unavailableText: "قد تكون انتهت أو لم تعد ضمن مختارات أفنتورا الحالية.",
      browse: "عرض مختارات جدة",
      aventuraSuggests: "اقتراح أفنتورا",
      mealLabel: "الوجبة الأنسب",
      source: "مصدر الفعالية ↗",
      formTitle: "ما الذي تريد أن ننسّقه؟",
      formText: "لا يوجد دفع هنا. يراجع فريق أفنتورا الطلب ثم يتواصل معك لتأكيد التوفر والتفاصيل.",
      name: "الاسم",
      phone: "الجوال / واتساب",
      email: "البريد الإلكتروني",
      company: "الجهة أو الشركة",
      optional: "اختياري",
      guests: "عدد الضيوف",
      attendanceDate: "يوم حضور الفعالية",
      servicesTitle: "اختر الخدمات المطلوبة",
      serviceTransport: "تنقل خاص",
      serviceDining: "غداء أو عشاء وفق توقيت الفعالية",
      serviceHistoric: "جولة جدة التاريخية",
      serviceWaterfront: "واجهة جدة أو تجربة بحرية",
      serviceCompanion: "مرافق أو مترجم",
      serviceCustom: "تنسيق خاص حسب الطلب",
      pickup: "موقع الاستلام أو الفندق",
      notes: "ملاحظة قصيرة",
      submit: "أرسل طلب التنسيق",
      successTitle: "تم استلام طلبك",
      successText: "سنراجع الفعالية والخدمات المطلوبة ثم نتواصل معك.",
      consent: "أوافق على معالجة بياناتي لغرض مراجعة طلبي والتواصل معي وفق ",
      privacy: "سياسة الخصوصية",
      servicesError: "اختر خدمة واحدة على الأقل.",
      sending: "جارٍ إرسال الطلب…",
      sendError: "تعذر إرسال الطلب الآن. حاول مرة أخرى.",
      selectDate: "اختر اليوم"
    },
    en: {
      back: "← Back to the picks",
      title: "Plan your experience around the event",
      intro: "The event is already selected. Tell us who is joining and what you want us to coordinate around its schedule.",
      unavailableTitle: "This event is not available for requests now",
      unavailableText: "It may have ended or no longer be part of Aventura's current selection.",
      browse: "View Jeddah picks",
      aventuraSuggests: "Aventura suggests",
      mealLabel: "Best meal timing",
      source: "Event source ↗",
      formTitle: "What would you like us to coordinate?",
      formText: "No payment is taken here. Aventura reviews the request and contacts you to confirm availability and details.",
      name: "Name",
      phone: "Mobile / WhatsApp",
      email: "Email",
      company: "Company or organisation",
      optional: "Optional",
      guests: "Number of guests",
      attendanceDate: "Event attendance date",
      servicesTitle: "Choose the services you need",
      serviceTransport: "Private transport",
      serviceDining: "Lunch or dinner timed around the event",
      serviceHistoric: "Historic Jeddah visit",
      serviceWaterfront: "Jeddah waterfront or sea experience",
      serviceCompanion: "Companion or interpreter",
      serviceCustom: "Custom coordination",
      pickup: "Pickup area or hotel",
      notes: "Short note",
      submit: "Send coordination request",
      successTitle: "Your request has been received",
      successText: "We will review the event and requested services, then contact you.",
      consent: "I agree that Aventura may process my data to review my request and contact me under the ",
      privacy: "Privacy Policy",
      servicesError: "Choose at least one service.",
      sending: "Sending your request…",
      sendError: "We could not send the request right now. Please try again.",
      selectDate: "Choose a date"
    },
    es: {
      back: "← Volver a la selección",
      title: "Organiza tu experiencia alrededor del evento",
      intro: "El evento ya está seleccionado. Cuéntanos quién te acompaña y qué servicios quieres coordinar alrededor de su horario.",
      unavailableTitle: "Este evento no está disponible para solicitudes ahora",
      unavailableText: "Puede haber finalizado o ya no formar parte de la selección actual de Aventura.",
      browse: "Ver selección de Yeda",
      aventuraSuggests: "Aventura propone",
      mealLabel: "Mejor momento para la comida",
      source: "Fuente del evento ↗",
      formTitle: "¿Qué quieres que coordinemos?",
      formText: "Aquí no se realiza ningún pago. Aventura revisará la solicitud y te contactará para confirmar disponibilidad y detalles.",
      name: "Nombre",
      phone: "Móvil / WhatsApp",
      email: "Correo electrónico",
      company: "Empresa u organización",
      optional: "Opcional",
      guests: "Número de invitados",
      attendanceDate: "Fecha de asistencia",
      servicesTitle: "Elige los servicios que necesitas",
      serviceTransport: "Transporte privado",
      serviceDining: "Almuerzo o cena según el horario del evento",
      serviceHistoric: "Visita a Yeda Histórica",
      serviceWaterfront: "Paseo marítimo o experiencia en el mar",
      serviceCompanion: "Acompañante o intérprete",
      serviceCustom: "Coordinación personalizada",
      pickup: "Zona de recogida u hotel",
      notes: "Nota breve",
      submit: "Enviar solicitud",
      successTitle: "Hemos recibido tu solicitud",
      successText: "Revisaremos el evento y los servicios solicitados y nos pondremos en contacto contigo.",
      consent: "Acepto que Aventura trate mis datos para revisar mi solicitud y ponerse en contacto conmigo conforme a la ",
      privacy: "Política de privacidad",
      servicesError: "Elige al menos un servicio.",
      sending: "Enviando tu solicitud…",
      sendError: "No pudimos enviar la solicitud ahora. Inténtalo de nuevo.",
      selectDate: "Elige una fecha"
    }
  };

  var SERVICE_LABEL_KEYS = {
    private_transport: "serviceTransport",
    dining: "serviceDining",
    historic_jeddah: "serviceHistoric",
    waterfront: "serviceWaterfront",
    companion_interpreter: "serviceCompanion",
    custom: "serviceCustom"
  };

  function normalizeLang(value) {
    var lang = String(value || "").toLowerCase();
    return LANGS.indexOf(lang) === -1 ? "ar" : lang;
  }

  function query() {
    return new URLSearchParams(root.location.search || "");
  }

  function currentLang() {
    return normalizeLang(query().get("lang") || (document.documentElement && document.documentElement.lang));
  }

  function localized(value, lang) {
    if (value && typeof value === "object") return value[lang] || value.ar || value.en || value.es || "";
    return String(value || "");
  }

  function saudiToday(date) {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: SAUDI_TZ,
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

  function addDay(iso) {
    var d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function availableDates(event, today) {
    var start = event.startDate > today ? event.startDate : today;
    var end = event.endDate;
    var explicit = Array.isArray(event.availableDates) ? event.availableDates : null;
    if (explicit) {
      return explicit.filter(function (date) { return date >= start && date <= end; });
    }
    var dates = [];
    for (var cursor = start; cursor <= end; cursor = addDay(cursor)) dates.push(cursor);
    return dates;
  }

  function dateObject(iso) {
    return new Date(iso + "T12:00:00Z");
  }

  function formatDate(iso, lang) {
    return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.ar, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(dateObject(iso));
  }

  function formatRange(event, lang) {
    if (event.startDate === event.endDate) return formatDate(event.startDate, lang);
    return formatDate(event.startDate, lang) + " – " + formatDate(event.endDate, lang);
  }

  function formatClock(time, lang) {
    if (!/^\d{2}:\d{2}$/.test(String(time || ""))) return "";
    var p = time.split(":");
    var d = new Date(Date.UTC(2026, 0, 1, Number(p[0]), Number(p[1])));
    return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.ar, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    }).format(d);
  }

  function formatTime(event, lang) {
    var doors = formatClock(event.doorsTime, lang);
    var start = formatClock(event.startTime, lang);
    var end = formatClock(event.endTime, lang);
    var result = "";
    if (doors) result += (lang === "ar" ? "فتح الأبواب " : (lang === "es" ? "Apertura " : "Doors ")) + doors;
    if (start || end) {
      if (result) result += " · ";
      result += start && end ? start + " – " + end : (start || end);
    }
    return result;
  }

  function applyCopy(lang) {
    var copy = COPY[lang] || COPY.ar;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-jpr]").forEach(function (node) {
      var key = node.getAttribute("data-jpr");
      if (copy[key]) node.textContent = copy[key];
    });
    var consent = document.querySelector("[data-jpr-consent]");
    if (consent) {
      consent.replaceChildren(document.createTextNode(copy.consent));
      var link = document.createElement("a");
      link.href = "privacy.html" + (lang === "ar" ? "" : "?lang=" + encodeURIComponent(lang));
      link.textContent = copy.privacy;
      consent.appendChild(link);
      consent.appendChild(document.createTextNode("."));
    }
    document.querySelectorAll("a[href='jeddah-picks.html']").forEach(function (link) {
      link.href = "jeddah-picks.html" + (lang === "ar" ? "" : "?lang=" + encodeURIComponent(lang));
    });
  }

  function renderDateControl(form, event, lang) {
    var wrap = document.querySelector("[data-jpr-date-control]");
    var hidden = form.querySelector('[name="attendance_date"]');
    var dates = availableDates(event, saudiToday());
    if (!wrap || !hidden || !dates.length) return false;
    wrap.replaceChildren();

    if (dates.length === 1) {
      hidden.value = dates[0];
      var fixed = document.createElement("div");
      fixed.className = "jpr-date-fixed";
      fixed.textContent = formatDate(dates[0], lang);
      fixed.setAttribute("aria-label", (COPY[lang] || COPY.ar).attendanceDate);
      wrap.appendChild(fixed);
      return true;
    }

    var select = document.createElement("select");
    select.className = "jpr-date-select";
    select.required = true;
    select.setAttribute("aria-label", (COPY[lang] || COPY.ar).attendanceDate);
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = (COPY[lang] || COPY.ar).selectDate;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    dates.forEach(function (date) {
      var option = document.createElement("option");
      option.value = date;
      option.textContent = formatDate(date, lang);
      select.appendChild(option);
    });
    select.addEventListener("change", function () { hidden.value = select.value; });
    wrap.appendChild(select);
    return true;
  }

  function renderEvent(event, lang) {
    var img = document.querySelector("[data-jpr-event-image]");
    if (img) {
      img.src = event.image || "assets/images/hero-jeddah.webp";
      img.alt = localized(event.imageAlt, lang);
    }
    var map = {
      "[data-jpr-event-category]": localized(event.category, lang),
      "[data-jpr-event-title]": localized(event.title, lang),
      "[data-jpr-event-date]": formatRange(event, lang),
      "[data-jpr-event-location]": "⌖ " + localized(event.location, lang),
      "[data-jpr-event-plan]": localized(event.aventuraPlan, lang),
      "[data-jpr-event-meal]": localized(event.mealSuggestion, lang)
    };
    Object.keys(map).forEach(function (selector) {
      var node = document.querySelector(selector);
      if (node) node.textContent = map[selector];
    });
    var time = formatTime(event, lang);
    var timeNode = document.querySelector("[data-jpr-event-time]");
    if (timeNode) {
      timeNode.hidden = !time;
      timeNode.textContent = time ? "◷ " + time : "";
    }
    var mealWrap = document.querySelector("[data-jpr-meal-wrap]");
    if (mealWrap) mealWrap.hidden = !localized(event.mealSuggestion, lang);
    var source = document.querySelector("[data-jpr-event-source]");
    if (source) source.href = event.sourceUrl || "#";
  }

  function selectedServices(form) {
    return Array.prototype.slice.call(form.querySelectorAll("[data-jpr-services] input[type='checkbox']:checked"))
      .map(function (input) { return input.value; });
  }

  function serviceText(codes, lang) {
    var copy = COPY[lang] || COPY.ar;
    return codes.map(function (code) { return copy[SERVICE_LABEL_KEYS[code]] || code; }).join(" | ");
  }

  function setHidden(form, name, value) {
    var input = form.querySelector('[name="' + name + '"]');
    if (input) input.value = value == null ? "" : String(value);
  }

  function wireForm(form, event, lang) {
    form.addEventListener("submit", function (submitEvent) {
      submitEvent.preventDefault();
      var copy = COPY[lang] || COPY.ar;
      var codes = selectedServices(form);
      var serviceError = document.querySelector("[data-jpr-service-error]");
      if (!codes.length) {
        if (serviceError) {
          serviceError.hidden = false;
          serviceError.textContent = copy.servicesError;
        }
        return;
      }
      if (serviceError) serviceError.hidden = true;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var attendance = form.querySelector('[name="attendance_date"]');
      if (!attendance || !attendance.value) {
        var select = document.querySelector(".jpr-date-select");
        if (select) select.reportValidity();
        return;
      }

      setHidden(form, "request_language", lang);
      setHidden(form, "event_id", event.id);
      setHidden(form, "event_title", localized(event.title, lang));
      setHidden(form, "event_source_url", event.sourceUrl || "");
      setHidden(form, "selected_services", serviceText(codes, lang));
      setHidden(form, "privacy_consent_at", new Date().toISOString());

      var payload = new FormData(form);
      payload.append("_subject", "Aventura Jeddah picks request — " + localized(event.title, "en"));
      payload.append("_url", root.location.href);
      var email = form.querySelector('[name="email"]');
      if (email && email.value.trim()) payload.append("_replyto", email.value.trim());

      var status = document.querySelector("[data-jpr-status]");
      var button = document.querySelector("[data-jpr-submit]");
      if (status) status.textContent = copy.sending;
      if (button) button.disabled = true;

      root.fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok || body.success === false || body.success === "false") throw new Error("submit failed");
          return body;
        });
      }).then(function () {
        form.hidden = true;
        var success = document.querySelector("[data-jpr-success]");
        if (success) success.hidden = false;
        if (typeof root.gtag === "function") {
          root.gtag("event", "jeddah_pick_request_submit", { event_id: event.id });
        }
      }).catch(function () {
        if (status) status.textContent = copy.sendError;
        if (button) button.disabled = false;
      });
    });
  }

  function showUnavailable() {
    var loading = document.querySelector("[data-jpr-loading]");
    var error = document.querySelector("[data-jpr-error]");
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
  }

  async function init() {
    var lang = currentLang();
    applyCopy(lang);
    var eventId = query().get("event") || "";
    if (!eventId) {
      showUnavailable();
      return;
    }
    try {
      var response = await root.fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("data unavailable");
      var data = await response.json();
      var event = (data.events || []).find(function (item) {
        return item && item.active !== false && item.id === eventId;
      });
      if (!event || event.endDate < saudiToday()) {
        showUnavailable();
        return;
      }
      var form = document.querySelector("[data-jpr-form]");
      if (!form || !renderDateControl(form, event, lang)) {
        showUnavailable();
        return;
      }
      renderEvent(event, lang);
      wireForm(form, event, lang);
      var loading = document.querySelector("[data-jpr-loading]");
      var shell = document.querySelector("[data-jpr-shell]");
      if (loading) loading.hidden = true;
      if (shell) shell.hidden = false;
    } catch (error) {
      showUnavailable();
      console.warn("Aventura Jeddah picks request is unavailable.", error);
    }
  }

  root.AVENTURA_JEDDAH_PICKS_REQUEST = Object.freeze({
    version: "1.0.0",
    availableDates: availableDates,
    saudiToday: saudiToday
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}(typeof window !== "undefined" ? window : globalThis));

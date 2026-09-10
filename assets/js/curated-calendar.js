(function (root) {
  "use strict";

  var DATA_URL = "data/curated-events.json";
  var LANGUAGE_CODES = ["ar", "en", "es"];
  var LOCALES = { ar: "ar-SA", en: "en-GB", es: "es-ES" };
  var SAUDI_TIME_ZONE = "Asia/Riyadh";

  function normalizeLanguage(value) {
    var lang = String(value || "").toLowerCase();
    return LANGUAGE_CODES.indexOf(lang) !== -1 ? lang : "ar";
  }

  function currentLanguage() {
    if (typeof document === "undefined" || !document.documentElement) return "ar";
    return normalizeLanguage(document.documentElement.lang);
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

  function addDays(isoDate, amount) {
    var date = new Date(isoDate + "T12:00:00Z");
    date.setUTCDate(date.getUTCDate() + Number(amount || 0));
    return date.toISOString().slice(0, 10);
  }

  function filterEvents(events, today, windowDays) {
    var start = today || saudiToday();
    var end = addDays(start, Number(windowDays || 10));
    return (events || [])
      .filter(function (event) {
        if (!event || event.active === false || !event.startDate || !event.endDate) return false;
        return event.endDate >= start && event.startDate <= end;
      })
      .sort(function (a, b) {
        var priorityDifference = Number(a.priority || 999) - Number(b.priority || 999);
        if (priorityDifference) return priorityDifference;
        return String(a.startDate).localeCompare(String(b.startDate));
      });
  }

  function localized(value, lang) {
    if (value && typeof value === "object") {
      return value[lang] || value.ar || value.en || value.es || "";
    }
    return String(value || "");
  }

  function dateObject(isoDate) {
    return new Date(isoDate + "T12:00:00Z");
  }

  function formatDate(event, lang) {
    var locale = LOCALES[lang] || LOCALES.ar;
    var start = dateObject(event.startDate);
    var end = dateObject(event.endDate);
    var sameDay = event.startDate === event.endDate;
    var startFormatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: sameDay ? "short" : undefined,
      timeZone: "UTC"
    });
    if (sameDay) return startFormatter.format(start);

    var sameMonth = event.startDate.slice(0, 7) === event.endDate.slice(0, 7);
    if (sameMonth) {
      var dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" });
      var monthFormatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
      return dayFormatter.format(start) + "–" + dayFormatter.format(end) + " " + monthFormatter.format(end);
    }

    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(start) +
      " – " +
      new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(end);
  }

  function setUiText(section, ui, lang) {
    section.querySelectorAll("[data-curated-ui]").forEach(function (element) {
      var key = element.getAttribute("data-curated-ui");
      if (ui && ui[lang] && ui[lang][key]) element.textContent = ui[lang][key];
    });
    section.querySelectorAll("[data-curated-label]").forEach(function (element) {
      var key = element.getAttribute("data-curated-label");
      if (ui && ui[lang] && ui[lang][key]) element.setAttribute("aria-label", ui[lang][key]);
    });
  }

  function buildCard(event, data, lang) {
    var ui = data.ui[lang] || data.ui.ar;
    var article = document.createElement("article");
    article.className = "curated-card";
    article.dataset.curatedEvent = event.id;

    var media = document.createElement("div");
    media.className = "curated-card__media";
    var image = document.createElement("img");
    image.src = event.image;
    image.alt = localized(event.imageAlt, lang);
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);

    var date = document.createElement("span");
    date.className = "curated-card__date";
    date.textContent = formatDate(event, lang);
    media.appendChild(date);

    var category = document.createElement("span");
    category.className = "curated-card__category";
    category.textContent = localized(event.category, lang);
    media.appendChild(category);

    var body = document.createElement("div");
    body.className = "curated-card__body";

    var title = document.createElement("h3");
    title.textContent = localized(event.title, lang);
    body.appendChild(title);

    var location = document.createElement("p");
    location.className = "curated-card__location";
    location.textContent = "⌖ " + localized(event.location, lang);
    body.appendChild(location);

    var planLabel = document.createElement("span");
    planLabel.className = "curated-card__plan-label";
    planLabel.textContent = ui.planLabel;
    body.appendChild(planLabel);

    var plan = document.createElement("p");
    plan.className = "curated-card__plan";
    plan.textContent = localized(event.aventuraPlan, lang);
    body.appendChild(plan);

    var actions = document.createElement("div");
    actions.className = "curated-card__actions";

    var cta = document.createElement("a");
    cta.className = "curated-card__cta";
    cta.textContent = ui.cta;
    cta.href = "contact.html?source=curated-calendar&event=" + encodeURIComponent(event.id) + "&date=" + encodeURIComponent(event.startDate);
    actions.appendChild(cta);

    var source = document.createElement("a");
    source.className = "curated-card__source";
    source.textContent = ui.details;
    source.href = event.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    actions.appendChild(source);

    body.appendChild(actions);
    article.appendChild(media);
    article.appendChild(body);
    return article;
  }

  function render(section, data) {
    var lang = currentLanguage();
    var track = section.querySelector("[data-curated-track]");
    var visible = filterEvents(data.events, saudiToday(), data.windowDays || 10);
    setUiText(section, data.ui, lang);
    track.replaceChildren();

    if (!visible.length) {
      section.hidden = true;
      return;
    }

    visible.forEach(function (event) {
      track.appendChild(buildCard(event, data, lang));
    });
    section.hidden = false;
  }

  function wireControls(section) {
    var track = section.querySelector("[data-curated-track]");
    var previous = section.querySelector("[data-curated-prev]");
    var next = section.querySelector("[data-curated-next]");
    var position = 0;

    function move(amount) {
      var cards = Array.prototype.slice.call(track.querySelectorAll(".curated-card"));
      if (!cards.length) return;
      position = Math.max(0, Math.min(cards.length - 1, position + amount));
      cards[position].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }

    if (previous) previous.addEventListener("click", function () { move(-1); });
    if (next) next.addEventListener("click", function () { move(1); });
  }

  async function init() {
    var section = document.querySelector("[data-curated-calendar]");
    if (!section) return;

    try {
      var response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Curated calendar data request failed: " + response.status);
      var data = await response.json();
      render(section, data);
      wireControls(section);

      var observer = new MutationObserver(function (mutations) {
        if (mutations.some(function (mutation) { return mutation.attributeName === "lang"; })) {
          render(section, data);
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (error) {
      section.hidden = true;
      console.warn("Aventura Curated Calendar is unavailable.", error);
    }
  }

  var api = {
    version: "1.0.0",
    saudiToday: saudiToday,
    addDays: addDays,
    filterEvents: filterEvents,
    formatDate: formatDate
  };

  root.AVENTURA_CURATED_CALENDAR = Object.freeze(api);

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
}(typeof window !== "undefined" ? window : globalThis));

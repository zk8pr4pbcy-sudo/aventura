(function (root) {
  "use strict";

  var DATA_URL = "data/curated-events.json";
  var LANGUAGE_CODES = ["ar", "en", "es"];
  var LOCALES = { ar: "ar-SA", en: "en-GB", es: "es-ES" };
  var SAUDI_TIME_ZONE = "Asia/Riyadh";
  var HOME_LIMIT = 4;

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
    var days = Number(windowDays || 14);
    var end = addDays(start, Math.max(0, days - 1));
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
    if (value && typeof value === "object") return value[lang] || value.ar || value.en || value.es || "";
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

  function formatClock(time, lang) {
    if (!/^\d{2}:\d{2}$/.test(String(time || ""))) return "";
    var parts = String(time).split(":");
    var date = new Date(Date.UTC(2026, 0, 1, Number(parts[0]), Number(parts[1])));
    return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.ar, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    }).format(date);
  }

  function formatEventTime(event, lang) {
    var start = formatClock(event.startTime, lang);
    var end = formatClock(event.endTime, lang);
    var doors = formatClock(event.doorsTime, lang);
    var ui = event.timeLabels && event.timeLabels[lang] ? event.timeLabels[lang] : null;
    if (ui) return ui;
    var value = start && end ? start + " – " + end : (start || end);
    if (doors) {
      var doorsLabel = lang === "ar" ? "فتح الأبواب" : (lang === "es" ? "Apertura" : "Doors");
      value = doorsLabel + " " + doors + (value ? " · " + value : "");
    }
    return value;
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

  function setPageText(data, lang) {
    if (typeof document === "undefined" || !data.ui || !data.ui[lang]) return;
    var copy = data.ui[lang];
    var title = document.querySelector("[data-curated-page-title]");
    var description = document.querySelector("[data-curated-page-description]");
    var back = document.querySelector("[data-curated-page-back]");
    if (title && copy.pageTitle) title.textContent = copy.pageTitle;
    if (description && copy.pageDescription) description.textContent = copy.pageDescription;
    if (back && copy.pageBack) {
      back.textContent = copy.pageBack;
      back.href = "index.html" + (lang === "ar" ? "" : "?lang=" + encodeURIComponent(lang)) + "#curated-calendar";
    }
    if (document.body && document.body.dataset.page === "jeddah-picks") {
      if (copy.pageMetaTitle) document.title = copy.pageMetaTitle;
      var meta = document.querySelector('meta[name="description"]');
      if (meta && copy.pageMetaDescription) meta.setAttribute("content", copy.pageMetaDescription);
    }
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

    var timeText = formatEventTime(event, lang);
    if (timeText) {
      var time = document.createElement("p");
      time.className = "curated-card__time";
      time.textContent = "◷ " + (ui.timeLabel || "Time") + ": " + timeText;
      body.appendChild(time);
    }

    var planLabel = document.createElement("span");
    planLabel.className = "curated-card__plan-label";
    planLabel.textContent = ui.planLabel;
    body.appendChild(planLabel);

    var plan = document.createElement("p");
    plan.className = "curated-card__plan";
    plan.textContent = localized(event.aventuraPlan, lang);
    body.appendChild(plan);

    var mealText = localized(event.mealSuggestion, lang);
    if (mealText) {
      var meal = document.createElement("p");
      meal.className = "curated-card__meal";
      var mealStrong = document.createElement("strong");
      mealStrong.textContent = (ui.mealLabel || "Meal") + ": ";
      meal.appendChild(mealStrong);
      meal.appendChild(document.createTextNode(mealText));
      body.appendChild(meal);
    }

    var actions = document.createElement("div");
    actions.className = "curated-card__actions";

    var cta = document.createElement("a");
    cta.className = "curated-card__cta";
    cta.textContent = ui.cta;
    cta.href = "jeddah-picks/request/?source=curated-calendar&event=" + encodeURIComponent(event.id) + "&lang=" + encodeURIComponent(lang);
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

  function ensureViewAll(section, data, lang) {
    var mode = section.getAttribute("data-curated-mode") || "featured";
    var existing = section.querySelector("[data-curated-view-all]");
    if (mode === "all") {
      if (existing) existing.remove();
      return;
    }
    var ui = data.ui[lang] || data.ui.ar;
    var link = existing || document.createElement("a");
    link.className = "curated-calendar__view-all";
    link.setAttribute("data-curated-view-all", "");
    link.href = "jeddah-picks/" + (lang === "ar" ? "" : "?lang=" + encodeURIComponent(lang));
    link.textContent = ui.viewAll || "View all picks";
    if (!existing) {
      var disclaimer = section.querySelector(".curated-calendar__disclaimer");
      var footer = document.createElement("div");
      footer.className = "curated-calendar__footer";
      footer.appendChild(link);
      if (disclaimer && disclaimer.parentNode) disclaimer.parentNode.insertBefore(footer, disclaimer);
      else section.querySelector(".container").appendChild(footer);
    }
  }

  function render(section, data) {
    var lang = currentLanguage();
    var track = section.querySelector("[data-curated-track]");
    var allVisible = filterEvents(data.events, saudiToday(), data.windowDays || 14);
    var mode = section.getAttribute("data-curated-mode") || "featured";
    var visible = mode === "all" ? allVisible : allVisible.slice(0, HOME_LIMIT);
    setUiText(section, data.ui, lang);
    setPageText(data, lang);
    ensureViewAll(section, data, lang);
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
        if (mutations.some(function (mutation) { return mutation.attributeName === "lang"; })) render(section, data);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (error) {
      section.hidden = true;
      console.warn("Aventura Curated Calendar is unavailable.", error);
    }
  }

  var api = {
    version: "1.2.0",
    saudiToday: saudiToday,
    addDays: addDays,
    filterEvents: filterEvents,
    formatDate: formatDate,
    formatEventTime: formatEventTime
  };

  root.AVENTURA_CURATED_CALENDAR = Object.freeze(api);

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
}(typeof window !== "undefined" ? window : globalThis));

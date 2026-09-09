(function (root) {
  "use strict";

  var SUPPORTED_LANGUAGES = ["ar", "en", "es"];
  var DEFAULT_LANGUAGE = "ar";
  var SAUDI_TIME_ZONE = "Asia/Riyadh";

  function normalizeLanguage(value) {
    var language = String(value || "").toLowerCase();
    return SUPPORTED_LANGUAGES.indexOf(language) !== -1 ? language : DEFAULT_LANGUAGE;
  }

  function getLanguage() {
    if (typeof document !== "undefined" && document.documentElement) {
      return normalizeLanguage(document.documentElement.lang);
    }
    return DEFAULT_LANGUAGE;
  }

  function saudiDateParts(date) {
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
    return values;
  }

  function saudiDateToday(date) {
    var values = saudiDateParts(date);
    return values.year + "-" + values.month + "-" + values.day;
  }

  function minimumForInput(type, date) {
    var minimumDate = saudiDateToday(date);
    return type === "datetime-local" ? minimumDate + "T00:00" : minimumDate;
  }

  function isPastSaudiDate(value, type, date) {
    if (!value) return false;
    var minimum = minimumForInput(type, date);
    return String(value) < minimum;
  }

  var api = {
    version: "1.0.0",
    language: Object.freeze({
      default: DEFAULT_LANGUAGE,
      supported: Object.freeze(SUPPORTED_LANGUAGES.slice()),
      normalize: normalizeLanguage,
      get: getLanguage
    }),
    dates: Object.freeze({
      timeZone: SAUDI_TIME_ZONE,
      today: saudiDateToday,
      minimumForInput: minimumForInput,
      isPast: isPastSaudiDate
    })
  };

  root.AVENTURA_RUNTIME = Object.freeze(api);
}(typeof window !== "undefined" ? window : globalThis));

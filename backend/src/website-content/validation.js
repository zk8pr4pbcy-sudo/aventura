const CONTENT_TYPES = new Set(["event", "offer", "announcement", "experience"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value, maxLength) {
  if (value == null) return null;
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  if (cleaned.length > maxLength) return undefined;
  return cleaned || null;
}

function dateValue(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return undefined;
  return new Date(time).toISOString();
}

function mediaUrl(value) {
  const cleaned = text(value, 2000);
  if (cleaned == null) return cleaned;
  if (cleaned === undefined) return undefined;
  if (cleaned.startsWith("/")) return cleaned;
  try {
    const url = new URL(cleaned);
    return url.protocol === "https:" ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function payload(value) {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return undefined;
  try {
    const serialized = JSON.stringify(value);
    return Buffer.byteLength(serialized, "utf8") <= 32 * 1024 ? value : undefined;
  } catch {
    return undefined;
  }
}

function sortOrder(value) {
  if (value == null || value === "") return 0;
  const number = Number(value);
  if (!Number.isInteger(number) || number < -10000 || number > 10000) return undefined;
  return number;
}

function collect(input, partial) {
  const errors = {};
  const value = {};
  const has = (key) => Object.hasOwn(input, key);

  if (!partial || has("contentType")) {
    const contentType = text(input.contentType, 40);
    if (!contentType || !CONTENT_TYPES.has(contentType)) errors.contentType = "invalid";
    else value.contentType = contentType;
  }

  if (!partial || has("slug")) {
    const slug = text(input.slug, 120);
    if (!slug || !SLUG_PATTERN.test(slug)) errors.slug = "invalid";
    else value.slug = slug;
  }

  for (const [key, max, required] of [
    ["titleAr", 160, true],
    ["titleEn", 160, false],
    ["titleEs", 160, false],
    ["bodyAr", 20000, false],
    ["bodyEn", 20000, false],
    ["bodyEs", 20000, false]
  ]) {
    if (!partial || has(key)) {
      const cleaned = text(input[key], max);
      if (cleaned === undefined || (required && !partial && !cleaned) || (required && partial && has(key) && !cleaned)) {
        errors[key] = "invalid";
      } else {
        value[key] = cleaned;
      }
    }
  }

  if (!partial || has("mediaUrl")) {
    const cleaned = mediaUrl(input.mediaUrl);
    if (cleaned === undefined) errors.mediaUrl = "invalid";
    else value.mediaUrl = cleaned;
  }

  if (!partial || has("startsAt")) {
    const cleaned = dateValue(input.startsAt);
    if (cleaned === undefined) errors.startsAt = "invalid";
    else value.startsAt = cleaned;
  }

  if (!partial || has("endsAt")) {
    const cleaned = dateValue(input.endsAt);
    if (cleaned === undefined) errors.endsAt = "invalid";
    else value.endsAt = cleaned;
  }

  if (!partial || has("contentPayload")) {
    const cleaned = payload(input.contentPayload);
    if (cleaned === undefined) errors.contentPayload = "invalid";
    else value.contentPayload = cleaned;
  }

  if (!partial || has("sortOrder")) {
    const cleaned = sortOrder(input.sortOrder);
    if (cleaned === undefined) errors.sortOrder = "invalid";
    else value.sortOrder = cleaned;
  }

  const startsAt = value.startsAt ?? (!partial ? null : undefined);
  const endsAt = value.endsAt ?? (!partial ? null : undefined);
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    errors.endsAt = "must_be_after_start";
  }

  if (partial && Object.keys(value).length === 0 && Object.keys(errors).length === 0) {
    errors.content = "empty_update";
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function validateNewWebsiteContent(input = {}) {
  return collect(input, false);
}

export function validateWebsiteContentPatch(input = {}) {
  return collect(input, true);
}

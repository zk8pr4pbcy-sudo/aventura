const LANGUAGES = new Set(["ar", "en", "es"]);

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateExperienceRequest(input) {
  const errors = {};
  const fullName = cleanString(input.fullName);
  const email = cleanString(input.email);
  const phone = cleanString(input.phone);
  const experienceKey = cleanString(input.experienceKey);
  const language = cleanString(input.language || "ar");
  const partySize = input.partySize == null || input.partySize === "" ? null : Number(input.partySize);
  const requestedDate = cleanString(input.requestedDate);

  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "invalid";
  if (!email && !phone) errors.contact = "required";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid";
  if (phone.length > 40) errors.phone = "invalid";
  if (!experienceKey || experienceKey.length > 80) errors.experienceKey = "invalid";
  if (!LANGUAGES.has(language)) errors.language = "invalid";
  if (partySize !== null && (!Number.isInteger(partySize) || partySize < 1 || partySize > 100)) errors.partySize = "invalid";
  if (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) errors.requestedDate = "invalid";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      fullName,
      email: email || null,
      phone: phone || null,
      experienceKey,
      language,
      partySize,
      requestedDate: requestedDate || null
    }
  };
}

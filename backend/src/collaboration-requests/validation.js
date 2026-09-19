const LANGUAGES = new Set(["ar", "en", "es"]);

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCollaborationRequest(input) {
  const errors = {};
  const fullName = cleanString(input.fullName);
  const email = cleanString(input.email);
  const phone = cleanString(input.phone);
  const organizationName = cleanString(input.organizationName);
  const collaborationType = cleanString(input.collaborationType);
  const proposal = cleanString(input.proposal);
  const language = cleanString(input.language || "ar");

  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "invalid";
  if (!email && !phone) errors.contact = "required";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid";
  if (phone.length > 40) errors.phone = "invalid";
  if (organizationName.length > 160) errors.organizationName = "invalid";
  if (!collaborationType || collaborationType.length > 100) errors.collaborationType = "invalid";
  if (proposal.length < 10 || proposal.length > 5000) errors.proposal = "invalid";
  if (!LANGUAGES.has(language)) errors.language = "invalid";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      fullName,
      email: email || null,
      phone: phone || null,
      organizationName: organizationName || null,
      collaborationType,
      proposal,
      language
    }
  };
}

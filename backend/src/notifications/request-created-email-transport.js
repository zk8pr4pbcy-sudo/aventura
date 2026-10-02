const SUPPORTED_EVENTS = new Set([
  "experience_request.created",
  "collaboration_request.created"
]);

function valueOrDash(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

function buildExperienceText(request) {
  return [
    "تم استلام طلب تجربة جديد في نظام أفنتورا.",
    "",
    `رقم الطلب: ${request.referenceNumber}`,
    `العميل: ${valueOrDash(request.customer.fullName)}`,
    `البريد: ${valueOrDash(request.customer.email)}`,
    `الجوال: ${valueOrDash(request.customer.phone)}`,
    `اللغة: ${valueOrDash(request.customer.preferredLanguage)}`,
    `التجربة: ${valueOrDash(request.details.experienceKey)}`,
    `التاريخ المطلوب: ${valueOrDash(request.details.requestedDate)}`,
    `عدد الأشخاص: ${valueOrDash(request.details.partySize)}`,
    "",
    "يمكن متابعة الطلب وتحديث حالته من Aventura Management System."
  ].join("\n");
}

function buildCollaborationText(request) {
  return [
    "تم استلام طلب تعاون جديد في نظام أفنتورا.",
    "",
    `رقم الطلب: ${request.referenceNumber}`,
    `الاسم: ${valueOrDash(request.customer.fullName)}`,
    `الجهة: ${valueOrDash(request.details.organizationName)}`,
    `البريد: ${valueOrDash(request.customer.email)}`,
    `الجوال: ${valueOrDash(request.customer.phone)}`,
    `اللغة: ${valueOrDash(request.customer.preferredLanguage)}`,
    `نوع التعاون: ${valueOrDash(request.details.collaborationType)}`,
    `المقترح: ${valueOrDash(request.details.proposal)}`,
    "",
    "يمكن متابعة الطلب وتحديث حالته من Aventura Management System."
  ].join("\n");
}

export function createRequestCreatedEmailTransport({ contextRepository, mailer, operationsEmail }) {
  if (!contextRepository || typeof contextRepository.getRequest !== "function") {
    throw new Error("email context repository is required");
  }
  if (!mailer || typeof mailer.sendMail !== "function") {
    throw new Error("mailer is required");
  }
  if (!operationsEmail) {
    throw new Error("operations notification email is required");
  }

  return {
    async send(event) {
      if (!SUPPORTED_EVENTS.has(event.eventType)) {
        throw new Error("unsupported_notification_event");
      }

      const request = await contextRepository.getRequest({
        requestKind: event.requestKind,
        requestId: event.requestId
      });
      if (!request) throw new Error("notification_request_not_found");

      const isExperience = request.kind === "experience";
      const subject = isExperience
        ? `[Aventura] طلب تجربة جديد — ${request.referenceNumber}`
        : `[Aventura] طلب تعاون جديد — ${request.referenceNumber}`;
      const text = isExperience ? buildExperienceText(request) : buildCollaborationText(request);

      await mailer.sendMail({
        to: operationsEmail,
        subject,
        text,
        messageId: `<${event.id}@notifications.aventuraksa.com>`,
        headers: {
          "X-Aventura-Event-ID": event.id,
          "X-Aventura-Request-Reference": request.referenceNumber
        }
      });
    }
  };
}

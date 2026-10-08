const elements = {
  dashboardView: document.querySelector("#dashboardView"),
  refreshButton: document.querySelector("#refreshButton"),
  contentPanel: document.querySelector("#contentPanel"),
  contentTypeFilter: document.querySelector("#contentTypeFilter"),
  contentStatusFilter: document.querySelector("#contentStatusFilter"),
  newContentButton: document.querySelector("#newContentButton"),
  contentForm: document.querySelector("#contentForm"),
  contentFormTitle: document.querySelector("#contentFormTitle"),
  contentIdInput: document.querySelector("#contentIdInput"),
  contentTypeInput: document.querySelector("#contentTypeInput"),
  contentSlugInput: document.querySelector("#contentSlugInput"),
  contentTitleArInput: document.querySelector("#contentTitleArInput"),
  contentTitleEnInput: document.querySelector("#contentTitleEnInput"),
  contentTitleEsInput: document.querySelector("#contentTitleEsInput"),
  contentBodyArInput: document.querySelector("#contentBodyArInput"),
  contentBodyEnInput: document.querySelector("#contentBodyEnInput"),
  contentBodyEsInput: document.querySelector("#contentBodyEsInput"),
  contentMediaUrlInput: document.querySelector("#contentMediaUrlInput"),
  contentStartsAtInput: document.querySelector("#contentStartsAtInput"),
  contentEndsAtInput: document.querySelector("#contentEndsAtInput"),
  contentSortOrderInput: document.querySelector("#contentSortOrderInput"),
  contentPayloadInput: document.querySelector("#contentPayloadInput"),
  contentSaveButton: document.querySelector("#contentSaveButton"),
  contentPublishButton: document.querySelector("#contentPublishButton"),
  contentArchiveButton: document.querySelector("#contentArchiveButton"),
  contentMessage: document.querySelector("#contentMessage"),
  contentBody: document.querySelector("#contentBody"),
  contentEmptyState: document.querySelector("#contentEmptyState")
};

const allowedRoles = new Set(["owner", "admin", "content"]);
const typeLabels = {
  event: "فعالية",
  offer: "عرض",
  announcement: "إعلان",
  experience: "تجربة"
};
const statusLabels = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف"
};

const state = {
  user: null,
  items: [],
  selected: null,
  loadingAccess: false
};

function setMessage(text, success = false) {
  if (!elements.contentMessage) return;
  elements.contentMessage.textContent = text || "";
  elements.contentMessage.classList.toggle("success", Boolean(text && success));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(body?.error || "request_failed");
    error.status = response.status;
    error.fields = body?.fields || null;
    throw error;
  }
  return body;
}

function canManageContent(user = state.user) {
  return Boolean(user?.isActive && allowedRoles.has(user.role));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
    calendar: "gregory"
  }).format(date);
}

function toRiyadhInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

function fromRiyadhInput(value) {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00+03:00` : `${value}+03:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_content_date");
  return date.toISOString();
}

function parsePayload() {
  const raw = elements.contentPayloadInput.value.trim();
  if (!raw) return {};
  const value = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("invalid_content_payload");
  }
  return value;
}

function clearForm() {
  state.selected = null;
  elements.contentForm.reset();
  elements.contentIdInput.value = "";
  elements.contentTypeInput.value = "event";
  elements.contentSortOrderInput.value = "0";
  elements.contentPayloadInput.value = "{}";
  elements.contentFormTitle.textContent = "محتوى جديد";
  elements.contentPublishButton.hidden = true;
  elements.contentArchiveButton.hidden = true;
  setMessage("");
}

function fillForm(item) {
  state.selected = item;
  elements.contentIdInput.value = item.id;
  elements.contentTypeInput.value = item.contentType;
  elements.contentSlugInput.value = item.slug || "";
  elements.contentTitleArInput.value = item.titleAr || "";
  elements.contentTitleEnInput.value = item.titleEn || "";
  elements.contentTitleEsInput.value = item.titleEs || "";
  elements.contentBodyArInput.value = item.bodyAr || "";
  elements.contentBodyEnInput.value = item.bodyEn || "";
  elements.contentBodyEsInput.value = item.bodyEs || "";
  elements.contentMediaUrlInput.value = item.mediaUrl || "";
  elements.contentStartsAtInput.value = toRiyadhInput(item.startsAt);
  elements.contentEndsAtInput.value = toRiyadhInput(item.endsAt);
  elements.contentSortOrderInput.value = String(item.sortOrder ?? 0);
  elements.contentPayloadInput.value = JSON.stringify(item.contentPayload || {}, null, 2);
  elements.contentFormTitle.textContent = `${typeLabels[item.contentType] || item.contentType} — ${statusLabels[item.status] || item.status}`;
  elements.contentPublishButton.hidden = item.status === "published";
  elements.contentArchiveButton.hidden = item.status === "archived";
  setMessage("");
}

function collectForm() {
  return {
    contentType: elements.contentTypeInput.value,
    slug: elements.contentSlugInput.value.trim(),
    titleAr: elements.contentTitleArInput.value.trim(),
    titleEn: elements.contentTitleEnInput.value.trim() || null,
    titleEs: elements.contentTitleEsInput.value.trim() || null,
    bodyAr: elements.contentBodyArInput.value.trim() || null,
    bodyEn: elements.contentBodyEnInput.value.trim() || null,
    bodyEs: elements.contentBodyEsInput.value.trim() || null,
    mediaUrl: elements.contentMediaUrlInput.value.trim() || null,
    startsAt: fromRiyadhInput(elements.contentStartsAtInput.value),
    endsAt: fromRiyadhInput(elements.contentEndsAtInput.value),
    sortOrder: Number(elements.contentSortOrderInput.value || 0),
    contentPayload: parsePayload()
  };
}

function renderRows() {
  elements.contentBody.replaceChildren();
  elements.contentEmptyState.hidden = state.items.length > 0;

  for (const item of state.items) {
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.setAttribute("role", "button");

    const title = document.createElement("td");
    title.textContent = item.titleAr || item.slug;
    const type = document.createElement("td");
    type.textContent = typeLabels[item.contentType] || item.contentType;
    const status = document.createElement("td");
    status.textContent = statusLabels[item.status] || item.status;
    const window = document.createElement("td");
    window.textContent = item.startsAt || item.endsAt
      ? `${formatDate(item.startsAt)} — ${formatDate(item.endsAt)}`
      : "دائم حتى يتم أرشفته";
    const updated = document.createElement("td");
    updated.textContent = formatDate(item.updatedAt);

    row.append(title, type, status, window, updated);
    const open = () => openItem(item.id);
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    elements.contentBody.append(row);
  }
}

async function loadContent() {
  if (!canManageContent() || elements.dashboardView.hidden) return;
  const params = new URLSearchParams({ limit: "100" });
  if (elements.contentTypeFilter.value) params.set("type", elements.contentTypeFilter.value);
  if (elements.contentStatusFilter.value) params.set("status", elements.contentStatusFilter.value);
  const { items } = await api(`/api/v1/admin/content?${params.toString()}`);
  state.items = items;
  renderRows();
}

async function openItem(id) {
  try {
    const { item } = await api(`/api/v1/admin/content/${id}`);
    fillForm(item);
    elements.contentForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    setMessage("تعذر تحميل المحتوى.");
  }
}

async function syncAccess() {
  if (state.loadingAccess) return;
  if (!elements.contentPanel || elements.dashboardView.hidden) {
    state.user = null;
    if (elements.contentPanel) elements.contentPanel.hidden = true;
    return;
  }

  state.loadingAccess = true;
  try {
    const { user } = await api("/api/v1/admin/auth/session");
    state.user = user;
    elements.contentPanel.hidden = !canManageContent(user);
    if (canManageContent(user)) await loadContent();
  } catch {
    state.user = null;
    elements.contentPanel.hidden = true;
  } finally {
    state.loadingAccess = false;
  }
}

async function saveContent(event) {
  event.preventDefault();
  setMessage("");
  elements.contentSaveButton.disabled = true;
  try {
    const payload = collectForm();
    const id = elements.contentIdInput.value;
    const { item } = id
      ? await api(`/api/v1/admin/content/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await api("/api/v1/admin/content", { method: "POST", body: JSON.stringify(payload) });
    fillForm(item);
    await loadContent();
    setMessage("تم حفظ المحتوى كمسودة/تحديثه بنجاح.", true);
  } catch (error) {
    if (error.message === "content_slug_conflict") setMessage("المعرّف النصي مستخدم مسبقًا.");
    else if (error.message === "invalid_content_payload" || error instanceof SyntaxError) setMessage("بيانات JSON الإضافية غير صحيحة.");
    else if (error.message === "invalid_content_date") setMessage("أحد تواريخ العرض غير صحيح.");
    else if (error.message === "validation_failed") setMessage("راجع الحقول المطلوبة وفترة العرض قبل الحفظ.");
    else setMessage("تعذر حفظ المحتوى.");
  } finally {
    elements.contentSaveButton.disabled = false;
  }
}

async function changeStatus(action) {
  if (!state.selected) return;
  setMessage("");
  try {
    const { item } = await api(`/api/v1/admin/content/${state.selected.id}/${action}`, { method: "POST" });
    fillForm(item);
    await loadContent();
    setMessage(action === "publish" ? "تم نشر المحتوى." : "تمت أرشفة المحتوى.", true);
  } catch (error) {
    if (error.message === "content_window_expired") setMessage("انتهت فترة عرض هذا المحتوى ولا يمكن نشره.");
    else setMessage("تعذر تغيير حالة المحتوى.");
  }
}

if (elements.contentPanel) {
  clearForm();
  elements.contentForm.addEventListener("submit", saveContent);
  elements.newContentButton.addEventListener("click", clearForm);
  elements.contentPublishButton.addEventListener("click", () => changeStatus("publish"));
  elements.contentArchiveButton.addEventListener("click", () => changeStatus("archive"));
  elements.contentTypeFilter.addEventListener("change", () => loadContent().catch(() => {}));
  elements.contentStatusFilter.addEventListener("change", () => loadContent().catch(() => {}));
  elements.refreshButton.addEventListener("click", () => loadContent().catch(() => {}));

  new MutationObserver(() => {
    syncAccess().catch(() => {});
  }).observe(elements.dashboardView, { attributes: true, attributeFilter: ["hidden"] });

  syncAccess().catch(() => {});
}

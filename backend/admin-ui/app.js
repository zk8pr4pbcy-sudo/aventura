const elements = {
  loginView: document.querySelector("#loginView"),
  dashboardView: document.querySelector("#dashboardView"),
  userBar: document.querySelector("#userBar"),
  userName: document.querySelector("#userName"),
  userRole: document.querySelector("#userRole"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  logoutButton: document.querySelector("#logoutButton"),
  refreshButton: document.querySelector("#refreshButton"),
  kindFilter: document.querySelector("#kindFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  requestsBody: document.querySelector("#requestsBody"),
  emptyState: document.querySelector("#emptyState"),
  detailPanel: document.querySelector("#detailPanel"),
  detailKind: document.querySelector("#detailKind"),
  detailReference: document.querySelector("#detailReference"),
  closeDetailButton: document.querySelector("#closeDetailButton"),
  customerDetails: document.querySelector("#customerDetails"),
  requestDetails: document.querySelector("#requestDetails"),
  workflowControls: document.querySelector("#workflowControls"),
  statusForm: document.querySelector("#statusForm"),
  newStatusInput: document.querySelector("#newStatusInput"),
  statusNoteInput: document.querySelector("#statusNoteInput"),
  noteForm: document.querySelector("#noteForm"),
  internalNoteInput: document.querySelector("#internalNoteInput"),
  statusHistory: document.querySelector("#statusHistory"),
  internalNotes: document.querySelector("#internalNotes"),
  detailMessage: document.querySelector("#detailMessage"),
  statAll: document.querySelector("#statAll"),
  statActive: document.querySelector("#statActive"),
  statNew: document.querySelector("#statNew"),
  statExperience: document.querySelector("#statExperience"),
  statCollaboration: document.querySelector("#statCollaboration")
};

const state = {
  user: null,
  requests: [],
  selected: null
};

const roleLabels = {
  owner: "المالك",
  admin: "مدير النظام",
  operations: "العمليات",
  content: "المحتوى",
  viewer: "مشاهدة فقط"
};

const statusLabels = {
  new: "جديد",
  under_review: "تحت المراجعة",
  contacted: "تم التواصل",
  quoted: "تم إرسال عرض",
  confirmed: "مؤكد",
  not_suitable: "غير مناسب",
  cancelled: "ملغي",
  closed: "مغلق"
};

const transitions = {
  experience: {
    new: ["under_review", "cancelled"],
    under_review: ["contacted", "quoted", "not_suitable", "cancelled"],
    contacted: ["quoted", "confirmed", "not_suitable", "cancelled"],
    quoted: ["confirmed", "not_suitable", "cancelled"],
    confirmed: ["closed", "cancelled"],
    not_suitable: ["closed"],
    cancelled: ["closed"],
    closed: []
  },
  collaboration: {
    new: ["under_review", "cancelled"],
    under_review: ["contacted", "not_suitable", "cancelled"],
    contacted: ["confirmed", "not_suitable", "cancelled"],
    confirmed: ["closed", "cancelled"],
    not_suitable: ["closed"],
    cancelled: ["closed"],
    closed: [],
    quoted: []
  }
};

const detailLabels = {
  experienceKey: "التجربة",
  requestedDate: "التاريخ المطلوب",
  partySize: "عدد الأشخاص",
  organizationName: "الجهة",
  collaborationType: "نوع التعاون",
  proposal: "المقترح"
};

function setMessage(element, text, success = false) {
  element.textContent = text || "";
  element.classList.toggle("success", Boolean(success && text));
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
    if (response.status === 401) showLogin();
    const error = new Error(body?.error || "request_failed");
    error.status = response.status;
    throw error;
  }
  return body;
}

function showLogin() {
  state.user = null;
  state.selected = null;
  elements.dashboardView.hidden = true;
  elements.userBar.hidden = true;
  elements.loginView.hidden = false;
  elements.passwordInput.value = "";
}

function showDashboard(user) {
  state.user = user;
  elements.loginView.hidden = true;
  elements.dashboardView.hidden = false;
  elements.userBar.hidden = false;
  elements.userName.textContent = user.displayName || user.email;
  elements.userRole.textContent = roleLabels[user.role] || user.role;
}

function canManageRequests() {
  return ["owner", "admin", "operations"].includes(state.user?.role);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
    calendar: "gregory"
  }).format(date);
}

function addDefinition(list, label, value) {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value == null || value === "" ? "—" : String(value);
  list.append(term, description);
}

function statusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `badge badge-${status}`;
  badge.textContent = statusLabels[status] || status;
  return badge;
}

async function loadSummary() {
  const { summary } = await api("/api/v1/admin/dashboard/summary");
  elements.statAll.textContent = summary.totals.all;
  elements.statActive.textContent = summary.totals.active;
  elements.statNew.textContent = summary.totals.new;
  elements.statExperience.textContent = summary.totals.experience;
  elements.statCollaboration.textContent = summary.totals.collaboration;
}

function renderRequests() {
  elements.requestsBody.replaceChildren();
  elements.emptyState.hidden = state.requests.length > 0;

  for (const request of state.requests) {
    const row = document.createElement("tr");
    row.dataset.requestId = request.id;
    row.tabIndex = 0;
    row.setAttribute("role", "button");

    const reference = document.createElement("td");
    reference.className = "reference";
    reference.textContent = request.referenceNumber;

    const kind = document.createElement("td");
    kind.textContent = request.kind === "experience" ? "تجربة" : "تعاون";

    const customer = document.createElement("td");
    customer.textContent = request.customer?.fullName || request.details?.organizationName || "—";

    const status = document.createElement("td");
    status.append(statusBadge(request.status));

    const date = document.createElement("td");
    date.textContent = formatDate(request.createdAt);

    row.append(reference, kind, customer, status, date);
    row.addEventListener("click", () => openRequest(request.kind, request.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRequest(request.kind, request.id);
      }
    });
    elements.requestsBody.append(row);
  }
}

async function loadRequests() {
  const params = new URLSearchParams();
  if (elements.kindFilter.value) params.set("kind", elements.kindFilter.value);
  if (elements.statusFilter.value) params.set("status", elements.statusFilter.value);
  params.set("limit", "100");

  const { requests } = await api(`/api/v1/admin/requests?${params.toString()}`);
  state.requests = requests;
  renderRequests();
}

function renderTimeline(list, items, formatter) {
  list.replaceChildren();
  if (!items?.length) {
    const item = document.createElement("li");
    item.textContent = "لا توجد بيانات حتى الآن.";
    list.append(item);
    return;
  }
  for (const entry of items) {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const meta = document.createElement("small");
    text.textContent = formatter(entry);
    meta.textContent = formatDate(entry.changedAt || entry.createdAt);
    item.append(text, meta);
    list.append(item);
  }
}

function renderStatusOptions(request) {
  elements.newStatusInput.replaceChildren();
  const allowed = transitions[request.kind]?.[request.status] || [];
  if (!allowed.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "لا يوجد انتقال متاح";
    elements.newStatusInput.append(option);
    elements.newStatusInput.disabled = true;
    elements.statusForm.querySelector("button").disabled = true;
    return;
  }
  elements.newStatusInput.disabled = false;
  elements.statusForm.querySelector("button").disabled = false;
  for (const value of allowed) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = statusLabels[value] || value;
    elements.newStatusInput.append(option);
  }
}

function renderRequestDetail(request) {
  state.selected = request;
  elements.detailPanel.hidden = false;
  elements.detailKind.textContent = request.kind === "experience" ? "طلب تجربة" : "طلب تعاون";
  elements.detailReference.textContent = request.referenceNumber;
  elements.customerDetails.replaceChildren();
  addDefinition(elements.customerDetails, "الاسم", request.customer?.fullName);
  addDefinition(elements.customerDetails, "البريد", request.customer?.email);
  addDefinition(elements.customerDetails, "الجوال", request.customer?.phone);
  addDefinition(elements.customerDetails, "اللغة", request.customer?.preferredLanguage);

  elements.requestDetails.replaceChildren();
  addDefinition(elements.requestDetails, "الحالة", statusLabels[request.status] || request.status);
  addDefinition(elements.requestDetails, "تاريخ الإنشاء", formatDate(request.createdAt));
  for (const [key, value] of Object.entries(request.details || {})) {
    addDefinition(elements.requestDetails, detailLabels[key] || key, value);
  }

  elements.workflowControls.hidden = !canManageRequests();
  if (canManageRequests()) renderStatusOptions(request);

  renderTimeline(elements.statusHistory, request.statusHistory, (entry) => {
    const from = entry.fromStatus ? statusLabels[entry.fromStatus] || entry.fromStatus : "بداية الطلب";
    const to = statusLabels[entry.toStatus] || entry.toStatus;
    const actor = entry.changedBy?.displayName ? ` — ${entry.changedBy.displayName}` : "";
    const note = entry.note ? ` — ${entry.note}` : "";
    return `${from} ← ${to}${actor}${note}`;
  });
  renderTimeline(elements.internalNotes, request.internalNotes, (entry) => {
    const author = entry.author?.displayName ? ` — ${entry.author.displayName}` : "";
    return `${entry.body}${author}`;
  });
  setMessage(elements.detailMessage, "");
  elements.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function openRequest(kind, id) {
  try {
    const { request } = await api(`/api/v1/admin/requests/${kind}/${id}`);
    renderRequestDetail(request);
  } catch (error) {
    setMessage(elements.detailMessage, error.message === "request_not_found" ? "لم يعد الطلب موجودًا." : "تعذر تحميل تفاصيل الطلب.");
  }
}

async function refreshAll() {
  elements.refreshButton.disabled = true;
  try {
    await Promise.all([loadSummary(), loadRequests()]);
    if (state.selected) await openRequest(state.selected.kind, state.selected.id);
  } finally {
    elements.refreshButton.disabled = false;
  }
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(elements.loginMessage, "");
  const submit = elements.loginForm.querySelector("button[type='submit']");
  submit.disabled = true;
  try {
    const { user } = await api("/api/v1/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: elements.emailInput.value,
        password: elements.passwordInput.value
      })
    });
    showDashboard(user);
    elements.passwordInput.value = "";
    await refreshAll();
  } catch (error) {
    setMessage(elements.loginMessage, error.status === 401 ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "تعذر تسجيل الدخول حاليًا.");
  } finally {
    submit.disabled = false;
  }
});

elements.logoutButton.addEventListener("click", async () => {
  try {
    await api("/api/v1/admin/auth/logout", { method: "POST" });
  } finally {
    showLogin();
  }
});

elements.refreshButton.addEventListener("click", () => refreshAll().catch(() => {}));
elements.kindFilter.addEventListener("change", () => loadRequests().catch(() => {}));
elements.statusFilter.addEventListener("change", () => loadRequests().catch(() => {}));
elements.closeDetailButton.addEventListener("click", () => {
  state.selected = null;
  elements.detailPanel.hidden = true;
});

elements.statusForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.selected) return;
  setMessage(elements.detailMessage, "");
  try {
    await api(`/api/v1/admin/requests/${state.selected.kind}/${state.selected.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: elements.newStatusInput.value,
        note: elements.statusNoteInput.value
      })
    });
    elements.statusNoteInput.value = "";
    await Promise.all([loadSummary(), loadRequests(), openRequest(state.selected.kind, state.selected.id)]);
    setMessage(elements.detailMessage, "تم تحديث حالة الطلب.", true);
  } catch (error) {
    setMessage(elements.detailMessage, error.message === "invalid_status_transition" ? "هذا الانتقال بين الحالات غير مسموح." : "تعذر تحديث حالة الطلب.");
  }
});

elements.noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.selected) return;
  setMessage(elements.detailMessage, "");
  try {
    await api(`/api/v1/admin/requests/${state.selected.kind}/${state.selected.id}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: elements.internalNoteInput.value })
    });
    elements.internalNoteInput.value = "";
    await openRequest(state.selected.kind, state.selected.id);
    setMessage(elements.detailMessage, "تمت إضافة الملاحظة الداخلية.", true);
  } catch {
    setMessage(elements.detailMessage, "تعذر إضافة الملاحظة.");
  }
});

(async function bootstrap() {
  try {
    const { user } = await api("/api/v1/admin/auth/session");
    showDashboard(user);
    await refreshAll();
  } catch {
    showLogin();
  }
})();

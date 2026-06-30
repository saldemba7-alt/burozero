// services/api.js
// Camada de comunicação com o BuroZero Backend

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://burozero-production.up.railway.app/api";
let AUTH_TOKEN = "";
export function setAuthToken(token) { AUTH_TOKEN = token || ""; }

// ── helpers ──────────────────────────────────────────────────
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${res.status}`);
  }
  return res.json();
}

// ── PROCESSES ─────────────────────────────────────────────────
export const ProcessesAPI = {
  list: () =>
    request(`/processes/`),

  get: (id) =>
    request(`/processes/${id}`),

  create: (data) =>
    request(`/processes/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/processes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  markStepDone: (processId, stepOrder) =>
    request(`/processes/${processId}/steps/${stepOrder}/done`, {
      method: "PATCH",
    }),

  delete: (id) =>
    request(`/processes/${id}`, { method: "DELETE" }),
};

// ── ALERTS ───────────────────────────────────────────────────
export const AlertsAPI = {
  list: (unreadOnly = false) =>
    request(`/alerts/?unread_only=${unreadOnly}`),

  markRead: (id) =>
    request(`/alerts/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    request(`/alerts/read-all`, { method: "PATCH" }),
};

// ── CALENDAR ──────────────────────────────────────────────────
export const CalendarAPI = {
  getMonth: (year, month) =>
    request(`/calendar/?year=${year}&month=${month}`),

  getUpcoming: (days = 30) =>
    request(`/calendar/upcoming?days=${days}`),
};

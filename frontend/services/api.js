// services/api.js
// Camada de comunicação com o BuroZero Backend

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
const USER_ID  = "demo"; // substituir por auth real

// ── helpers ──────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
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
    request(`/processes/?user_id=${USER_ID}`),

  get: (id) =>
    request(`/processes/${id}`),

  create: (data) =>
    request(`/processes/?user_id=${USER_ID}`, {
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
    request(`/alerts/?user_id=${USER_ID}&unread_only=${unreadOnly}`),

  markRead: (id) =>
    request(`/alerts/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    request(`/alerts/read-all?user_id=${USER_ID}`, { method: "PATCH" }),
};

// ── CALENDAR ──────────────────────────────────────────────────
export const CalendarAPI = {
  getMonth: (year, month) =>
    request(`/calendar/?year=${year}&month=${month}`),

  getUpcoming: (days = 30) =>
    request(`/calendar/upcoming?days=${days}`),
};

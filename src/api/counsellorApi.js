import { api } from "./authApi";

// ─── Profile ──────────────────────────────────────────────
export const getCounsellorProfile = () =>
  api.get("/counsellor/profile");

export const updateCounsellorProfile = (data) =>
  api.patch("/counsellor/profile", data);

// ─── Student dashboards ───────────────────────────────────
export const getAssignedStudentDashboard = (studentId) =>
  api.get(`/counsellor/students/${studentId}`);

// ─── Sessions ─────────────────────────────────────────────
/**
 * GET /counsellor/sessions
 * Query params: { limit, upcoming, studentId }
 */
export const getCounsellorSessions = (params = {}) =>
  api.get("/counsellor/sessions", { params });

/**
 * POST /counsellor/sessions
 * Body: { studentId, scheduledAt, durationMinutes, type, notes }
 */
export const createSession = (data) =>
  api.post("/counsellor/sessions", data);

/**
 * PATCH /counsellor/sessions/:id
 * Body: { scheduledAt, durationMinutes, type, notes, status }
 */
export const updateSession = (id, data) =>
  api.patch(`/counsellor/sessions/${id}`, data);

/**
 * DELETE /counsellor/sessions/:id
 * Marks session as cancelled
 */
export const deleteSession = (id) =>
  api.delete(`/counsellor/sessions/${id}`);

// ─── Notes ────────────────────────────────────────────────
/**
 * GET /counsellor/notes?studentId=xxx
 * Returns all private notes for a student (counsellor-only)
 */
export const getCounsellorNotes = (studentId) =>
  api.get("/counsellor/notes", { params: { studentId } });

/**
 * POST /counsellor/notes
 * Body: { studentId, title, content }
 */
export const createNote = (data) =>
  api.post("/counsellor/notes", data);

/**
 * PATCH /counsellor/notes/:id
 * Body: { title, content }
 */
export const updateNote = (id, data) =>
  api.patch(`/counsellor/notes/${id}`, data);

/**
 * DELETE /counsellor/notes/:id
 */
export const deleteNote = (id) =>
  api.delete(`/counsellor/notes/${id}`);

// ─── Analytics ────────────────────────────────────────────
/**
 * GET /counsellor/analytics
 * Returns cohort-level stats for this counsellor's students
 * Scoped to counsellor's institution automatically on backend
 */
export const getCounsellorAnalytics = () =>
  api.get("/counsellor/analytics");
// src/api/volunteerApi.js
import { api } from './authApi';

// POST /api/volunteer — student submits application
export const submitVolunteerApplication = (data) => api.post('/api/volunteer', data);

// GET /api/volunteer/me — student views their own application
export const getMyVolunteerApplication = () => api.get('/api/volunteer/me');

// DELETE /api/volunteer/me — student withdraws pending application
export const withdrawVolunteerApplication = () => api.delete('/api/volunteer/me');

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /volunteer/admin/applications?status=
export const listVolunteerApplications = (status) =>
  api.get('/volunteer/admin/applications', { params: status ? { status } : {} });

// GET /volunteer/admin/applications/:id
export const getVolunteerApplicationById = (id) =>
  api.get(`/volunteer/admin/applications/${id}`);

// PATCH /volunteer/admin/assign/:id
export const assignVolunteerToCounsellor = (id, data) =>
  api.patch(`/volunteer/admin/assign/${id}`, data);

// ── Counsellor ─────────────────────────────────────────────────────────────

// PATCH /volunteer/counsellor/review/:id
export const counsellorReviewVolunteer = (id, data) =>
  api.patch(`/volunteer/counsellor/review/${id}`, data);

// ── Common (Admin / Assigned Counsellor) ───────────────────────────────────

// DELETE /volunteer/remove/:id
export const removeVolunteer = (id) =>
  api.delete(`/volunteer/remove/${id}`);

// PATCH /volunteer/admin/applications/:id/review
export const reviewVolunteerApplication = (id, data) =>
  api.patch(`/volunteer/admin/applications/${id}/review`, data);
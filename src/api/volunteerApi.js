// src/api/volunteerApi.js
import { api } from './authApi';

// POST /api/volunteer — student submits application
export const submitVolunteerApplication = (data) => api.post('/api/volunteer', data);

// GET /api/volunteer/me — student views their own application
export const getMyVolunteerApplication = () => api.get('/api/volunteer/me');

// DELETE /api/volunteer/me — student withdraws pending application
export const withdrawVolunteerApplication = () => api.delete('/api/volunteer/me');

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /api/volunteer/admin/applications?status=
export const listVolunteerApplications = (status) =>
  api.get('/api/volunteer/admin/applications', { params: status ? { status } : {} });

// GET /api/volunteer/admin/applications/:id
export const getVolunteerApplicationById = (id) =>
  api.get(`/api/volunteer/admin/applications/${id}`);

// PATCH /api/volunteer/admin/assign/:id
export const assignVolunteerToCounsellor = (id, data) =>
  api.patch(`/api/volunteer/admin/assign/${id}`, data);

// ── Counsellor ─────────────────────────────────────────────────────────────

// PATCH /api/volunteer/counsellor/review/:id
export const counsellorReviewVolunteer = (id, data) =>
  api.patch(`/api/volunteer/counsellor/review/${id}`, data);

// ── Common (Admin / Assigned Counsellor) ───────────────────────────────────

// DELETE /api/volunteer/remove/:id
export const removeVolunteer = (id) =>
  api.delete(`/api/volunteer/remove/${id}`);

// PATCH /api/volunteer/admin/applications/:id/review
export const reviewVolunteerApplication = (id, data) =>
  api.patch(`/api/volunteer/admin/applications/${id}/review`, data);
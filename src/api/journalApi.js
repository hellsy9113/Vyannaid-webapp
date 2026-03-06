import { api } from './authApi';

// POST /api/journal  — { title, body, prompt?, tags? }
export const createJournalEntry = (data) => api.post('/api/journal', data);

// GET /api/journal  — optionally ?year=&month=
export const getJournalEntries = (year, month) =>
  api.get('/api/journal', { params: { year, month } });

// GET /api/journal/:id
export const getJournalEntry = (id) => api.get(`/api/journal/${id}`);

// PATCH /api/journal/:id  — { title?, body?, tags? }
export const updateJournalEntry = (id, data) => api.patch(`/api/journal/${id}`, data);

// DELETE /api/journal/:id
export const deleteJournalEntry = (id) => api.delete(`/api/journal/${id}`);

// GET /api/journal/calendar?year=&month=
export const getJournalCalendar = (year, month) =>
  api.get('/api/journal/calendar', { params: { year, month } });
import { api } from "./authApi";

// POST /api/mood  — { moodScore: 1–10 }
export const logMood = (moodScore) => api.post("/mood", { moodScore });

// GET /api/mood/stats — returns { weekly, monthly, yearly }
export const getMoodStats = () => api.get("/mood/stats");
// GET /api/mood/weekly-breakdown — returns last 7 days with score per day
// Sends the client's UTC offset so the server groups by local calendar day
export const getWeeklyBreakdown = () => {
  const tz = -new Date().getTimezoneOffset(); // e.g. 330 for IST, -300 for EST
  return api.get('/mood/weekly-breakdown', { params: { tz } });
};
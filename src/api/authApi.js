import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Shared axios instance — all requests get the Bearer token automatically
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ─── 401 interceptor ────────────────────────────────────────────
// Only force-logout when the response body explicitly says the token
// is invalid/expired — NOT for every 401 (e.g. wrong role, missing
// permissions, or a race-condition on first load).
//
// Previously this wiped localStorage and hard-redirected on ANY 401,
// which caused admins/counsellors to be kicked to /login immediately
// after logging in because an API call on the dashboard returned 401
// (e.g. due to tokenVersion mismatch on seeded accounts).
// ────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response?.data?.error || error.response?.data?.message || "";
      const isTokenError =
        msg.includes("Invalid or expired token") ||
        msg.includes("Session expired") ||
        msg.includes("User no longer exists") ||
        msg.includes("No token provided") ||
        msg.includes("Invalid authorization format");

      // Only wipe session for definitive token errors, not permission/role errors
      if (isTokenError && window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser    = (data) => api.post("/auth/login", data);
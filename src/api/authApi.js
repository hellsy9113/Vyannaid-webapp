import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

// Shared axios instance — all requests get the Bearer token automatically
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Tells ngrok free tier to skip its browser warning interstitial page.
    // Safe to include always — non-ngrok servers ignore unknown headers.
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  
  // ── Public Routes ─────────────────────────────────────────────
  // These routes DO NOT require a token to be sent.
  const publicRoutes = ["/auth/login", "/auth/register", "/api/music", "/"];
  const isPublic = publicRoutes.some(route => req.url.startsWith(route));

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  } else if (!isPublic) {
    // Prevent execution of protected calls if no token is available
    console.warn(`[API] Blocked protected request to ${req.url} - No token found.`);
    return Promise.reject(new Error("No token provided. Request blocked."));
  }

  return req;
});

// ── Shared Authenticated Request Helper ──────────────────────────
/**
 * Wrapper for API calls to ensure a token is present.
 * usage: authenticatedRequest(() => api.get('/protected-route'))
 */
export const authenticatedRequest = async (apiCall) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("/login");
    throw new Error("Session expired. Please log in.");
  }
  return apiCall();
};

// ─── 401 interceptor ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If request was blocked by our request interceptor above
    if (error.message === "No token provided. Request blocked.") {
      if (window.location.pathname !== "/login") {
         window.location.replace("/login");
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const msg = error.response?.data?.error || error.response?.data?.message || "";
      const isTokenError =
        msg.includes("Invalid or expired token") ||
        msg.includes("Session expired") ||
        msg.includes("User no longer exists") ||
        msg.includes("No token provided") ||
        msg.includes("Invalid authorization format");

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
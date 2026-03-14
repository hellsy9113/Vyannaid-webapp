import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// ── Canonical home per role ────────────────────────────────────
// MUST include every role that exists, otherwise ProtectedRoute
// falls through to "/" which triggers HomeRoute → infinite loop.
const ROLE_HOME = {
  admin:      "/dashboard/admin",
  counsellor: "/dashboard/counsellor",
  student:    "/dashboard/student",
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // Not logged in → login page
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Wrong role → redirect to that role's own home (never back to "/")
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest = ROLE_HOME[user.role] ?? "/login";
    return <Navigate to={dest} replace />;
  }

  // New student who hasn't completed profile setup
  if (user.role === "student" && user.profileComplete === false) {
    return <Navigate to="/profile/setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
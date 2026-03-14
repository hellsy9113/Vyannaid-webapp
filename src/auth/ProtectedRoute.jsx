import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ROLE_HOME = {
  admin:      "/dashboard/admin",
  counsellor: "/dashboard/counsellor",
  student:    "/dashboard/student",
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // 1. Not logged in → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Wrong role → that role's own dashboard (never "/" which causes loops)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
  }

  // 3. Incomplete profile setup — STUDENTS ONLY.
  //    Admin and counsellor accounts NEVER go through onboarding.
  //    Guard is skipped if already on /profile/setup to prevent loops.
  if (
    user.role === "student" &&
    user.profileComplete === false &&
    location.pathname !== "/profile/setup"
  ) {
    return <Navigate to="/profile/setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
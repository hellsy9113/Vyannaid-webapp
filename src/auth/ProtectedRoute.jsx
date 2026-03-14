import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ROLE_HOME = {
  admin:   "/dashboard/admin",
  student: "/dashboard/student",
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // Not logged in → login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Wrong role → their own home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  }

  // New student hasn't completed setup yet → force it
  // Strict === false so undefined (old sessions) is treated as complete
  if (user.role === 'student' && user.profileComplete === false) {
    return <Navigate to="/profile/setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
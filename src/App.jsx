import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// ── Landing page ────────────────────────────────────────────────
import LandingLayout from "./components/LandingPage/LandingLayout";
import Hero from "./components/LandingPage/Hero";
import GentleInsights from "./components/LandingPage/GentleInsights";
import CoreConnections from "./components/LandingPage/CoreConnections";
import CTA from "./components/LandingPage/CTA";

// ── Auth pages ──────────────────────────────────────────────────
import Login from "./pages/Login";
import Register from "./pages/Register";

// ── Student onboarding ──────────────────────────────────────────
import StudentProfileSetup from "./pages/StudentProfileSetup";

// ── Student pages ───────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Appointments from "./pages/Appointments";
import Activities from "./pages/Activities";
import Analytics from "./pages/Analytics";
import Chatbot from "./pages/Chatbot";
import VolunteerChat from "./pages/VolunteerChat";
import ControlledRespiration from "./pages/ControlledRespiration";
import ProfilePage from "./pages/ProfilePage";
import JournalingHome from "./pages/JournalingHome";
import JournalingEditor from "./pages/JournalingEditor";
import VolunteerApplication from "./pages/VolunteerApplication";
import VolunteerForm from "./pages/VolunteerForm";
import CalmMusic from "./pages/CalmMusic";

// ── Admin pages ─────────────────────────────────────────────────
import AdminDashboard from "./pages/AdminDashboard";

// ────────────────────────────────────────────────────────────────

const ROLE_HOME = {
  admin:   "/dashboard/admin",
  student: "/dashboard/student",
};

const Home = () => (
  <>
    <Hero />
    <GentleInsights />
    <CoreConnections />
    <CTA />
  </>
);

const HomeRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Home />;
  return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
};

const GuestOnly = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
  return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
};

// Guards /profile/setup — students only, skips if already complete
const SetupRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== 'student') return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  if (user.institution?.trim() && user.course?.trim()) {
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public (landing Navbar/Footer) ── */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          </Route>

          {/* ── Student first-login setup ── */}
          <Route path="/profile/setup" element={
            <SetupRoute><StudentProfileSetup /></SetupRoute>
          } />

          {/* ════════════════════════════════════ */}
          {/*  STUDENT ROUTES                      */}
          {/* ════════════════════════════════════ */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={["student"]}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/community" element={
            <ProtectedRoute allowedRoles={["student"]}><Community /></ProtectedRoute>
          } />
          <Route path="/dashboard/appointments" element={
            <ProtectedRoute allowedRoles={["student"]}><Appointments /></ProtectedRoute>
          } />
          <Route path="/dashboard/activities" element={
            <ProtectedRoute allowedRoles={["student"]}><Activities /></ProtectedRoute>
          } />
          <Route path="/dashboard/analytics" element={
            <ProtectedRoute allowedRoles={["student"]}><Analytics /></ProtectedRoute>
          } />
          <Route path="/dashboard/chatbot" element={
            <ProtectedRoute allowedRoles={["student"]}><Chatbot /></ProtectedRoute>
          } />
          <Route path="/dashboard/volunteer-chat" element={
            <ProtectedRoute allowedRoles={["student"]}><VolunteerChat /></ProtectedRoute>
          } />
          <Route path="/dashboard/controlled-respiration" element={
            <ProtectedRoute allowedRoles={["student"]}><ControlledRespiration /></ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute allowedRoles={["student"]}><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/dashboard/volunteer" element={
            <ProtectedRoute allowedRoles={["student"]}><VolunteerApplication /></ProtectedRoute>
          } />
          <Route path="/dashboard/volunteer/apply" element={
            <ProtectedRoute allowedRoles={["student"]}><VolunteerForm /></ProtectedRoute>
          } />
          <Route path="/dashboard/calm-music" element={
            <ProtectedRoute allowedRoles={["student"]}><CalmMusic /></ProtectedRoute>
          } />

          {/* ── Journal ── */}
          <Route path="/dashboard/journaling" element={
            <ProtectedRoute allowedRoles={["student"]}><JournalingHome /></ProtectedRoute>
          } />
          <Route path="/dashboard/journaling/new" element={
            <ProtectedRoute allowedRoles={["student"]}><JournalingEditor /></ProtectedRoute>
          } />
          <Route path="/dashboard/journaling/:id" element={
            <ProtectedRoute allowedRoles={["student"]}><JournalingEditor /></ProtectedRoute>
          } />

          {/* ════════════════════════════════════ */}
          {/*  ADMIN ROUTES                        */}
          {/* ════════════════════════════════════ */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<HomeRoute />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
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

// ── Counsellor pages ─────────────────────────────────────────────
import CounsellorOverview    from "./pages/CounsellorOverview";
import CounsellorStudents    from "./pages/CounsellorStudents";
import CounsellorSessions    from "./pages/CounsellorSessions";
import CounsellorNotes       from "./pages/CounsellorNotes";
import CounsellorAnalytics   from "./pages/CounsellorAnalytics";
import CounsellorMessages    from "./pages/CounsellorMessages";
import CounsellorResources   from "./pages/CounsellorResources";
import CounsellorSettings    from "./pages/CounsellorSettings";

// ── Admin pages ──────────────────────────────────────────────────
import AdminOverview    from "./pages/AdminOverview";
import AdminUsers       from "./pages/AdminUsers";
import AdminAssign      from "./pages/AdminAssign";
import AdminCreateStaff from "./pages/AdminCreateStaff";

// ────────────────────────────────────────────────────────────────
// Role → home path mapping.
// Every possible role MUST be listed here.
// If a role is missing, ProtectedRoute falls back to "/login".
// ────────────────────────────────────────────────────────────────
const ROLE_HOME = {
  admin:      "/dashboard/admin",
  counsellor: "/dashboard/counsellor",
  student:    "/dashboard/student",
};

// ── Guard components ─────────────────────────────────────────────

const Home = () => (
  <>
    <Hero />
    <GentleInsights />
    <CoreConnections />
    <CTA />
  </>
);

/** "/" — show landing for guests, redirect to role home for authenticated users */
const HomeRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Home />;
  // Use login to known role path; fallback to login so there's never a loop
  return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
};

/** Public-only pages (login / register) — redirect authenticated users home */
const GuestOnly = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
  return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
};

/** /profile/setup guard — students only, skip if already complete */
const SetupRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== "student") return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
  if (user.institution?.trim() && user.course?.trim()) {
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

// ── App ──────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public (landing Navbar / Footer) ── */}
          <Route element={<LandingLayout />}>
            <Route path="/"         element={<HomeRoute />} />
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
          {/*  COUNSELLOR ROUTES                   */}
          {/* ════════════════════════════════════ */}
          <Route path="/dashboard/counsellor" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorOverview /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/students" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorStudents /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/sessions" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorSessions /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/notes" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorNotes /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/analytics" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorAnalytics /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/messages" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorMessages /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/resources" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorResources /></ProtectedRoute>
          } />
          <Route path="/dashboard/counsellor/settings" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorSettings /></ProtectedRoute>
          } />

          {/* ════════════════════════════════════ */}
          {/*  ADMIN ROUTES                        */}
          {/* ════════════════════════════════════ */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminOverview /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/counsellors" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/students" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/assign" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminAssign /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/staff" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminCreateStaff /></ProtectedRoute>
          } />

          {/* ── Catch-all: authenticated → role home, guest → landing ── */}
          <Route path="*" element={<HomeRoute />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
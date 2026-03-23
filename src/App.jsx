import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import CounsellorOverview  from "./pages/CounsellorOverview";
import CounsellorStudents  from "./pages/CounsellorStudents";
import CounsellorSessions  from "./pages/CounsellorSessions";
import CounsellorNotes     from "./pages/CounsellorNotes";
import CounsellorAnalytics from "./pages/CounsellorAnalytics";
import CounsellorMessages  from "./pages/CounsellorMessages";
import CounsellorResources from "./pages/CounsellorResources";
import CounsellorSettings  from "./pages/CounsellorSettings";

// ── Admin pages ──────────────────────────────────────────────────
import AdminOverview    from "./pages/AdminOverview";
import AdminUsers       from "./pages/AdminUsers";
import AdminAssign      from "./pages/AdminAssign";
import AdminCreateStaff from "./pages/AdminCreateStaff";
import AdminVolunteers   from "./pages/AdminVolunteers";

// ── Counsellor volunteer management ───────────────────────────────
import CounsellorVolunteers from "./pages/CounsellorVolunteers";

// ── Video / Voice call ─────────────────────────────────────────
// Accessible to both students AND counsellors
import VideoCall from "./pages/VideoCall";


// ─────────────────────────────────────────────────────────────────
// ROLE_HOME — canonical landing page per role.
// Every role MUST be listed. Missing role → navigate undefined → loop.
// ─────────────────────────────────────────────────────────────────
const ROLE_HOME = {
  admin:      "/dashboard/admin",
  counsellor: "/dashboard/counsellor",
  student:    "/dashboard/student",
};

// ── Guard components ──────────────────────────────────────────────

const Home = () => (
  <>
    <Hero />
    <GentleInsights />
    <CoreConnections />
    <CTA />
  </>
);

/**
 * HomeRoute — "/"
 * Guests see the landing page.
 * Authenticated users go to their role home.
 */
const HomeRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Home />;
  return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
};

/**
 * GuestOnly — wraps /login and /register.
 * Authenticated users are redirected away immediately.
 */
const GuestOnly = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
  return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
};

/**
 * SetupRoute — wraps /profile/setup.
 *
 * Rules:
 *  - Not logged in         → /login
 *  - Not a student         → their ROLE_HOME (admin/counsellor never need setup)
 *  - profileComplete=true  → /dashboard/student  (already done, skip)
 *  - Otherwise             → show the setup page
 *
 * Deliberately does NOT check institution/course strings — that was the
 * source of the bounce loop when those were filled but profileComplete
 * was still false.
 */
const SetupRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== "student") {
    return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
  }
  // profileComplete undefined or true → already done
  if (user.profileComplete !== false) {
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

// ── App ───────────────────────────────────────────────────────────

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
          
            {/* ════════════════════════════════════════════════════ */}
          {/*  VIDEO / VOICE CALL                                  */}
          {/*  /call/:sessionId — sessionId is MongoDB Session._id */}
          {/*  Both student and counsellor can join the same room   */}
          {/* ════════════════════════════════════════════════════ */}
          <Route path="/call/:sessionId" element={
            <ProtectedRoute allowedRoles={["student", "counsellor"]}>
              <VideoCall />
            </ProtectedRoute>
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
          <Route path="/dashboard/counsellor/volunteers" element={
            <ProtectedRoute allowedRoles={["counsellor"]}><CounsellorVolunteers /></ProtectedRoute>
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
          <Route path="/dashboard/admin/volunteers" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminVolunteers /></ProtectedRoute>
          } />

          {/* ── Catch-all ── */}
          <Route path="*" element={<HomeRoute />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

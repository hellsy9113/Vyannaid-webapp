// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "./auth/AuthContext";
// import ProtectedRoute from "./auth/ProtectedRoute";

// // Landing page components
// import LandingLayout from "./components/LandingPage/LandingLayout";
// import Hero from "./components/LandingPage/Hero";
// import GentleInsights from "./components/LandingPage/GentleInsights";
// import CoreConnections from "./components/LandingPage/CoreConnections";
// import CTA from "./components/LandingPage/CTA";

// // Auth pages
// import Login from "./pages/Login";
// import Register from "./pages/Register";

// // Role dashboards
// import Dashboard from "./pages/Dashboard";
// import CounsellorDashboard from "./pages/CounsellorDashboard";
// import AdminDashboard from "./pages/AdminDashboard";

// // Student sub-pages
// import Community    from "./pages/Community";
// import Appointments from "./pages/Appointments";
// import Activities   from "./pages/Activities";
// import Analytics    from "./pages/Analytics";
// import Chatbot      from "./pages/Chatbot";

// const Home = () => (
//   <>
//     <Hero />
//     <GentleInsights />
//     <CoreConnections />
//     <CTA />
//   </>
// );

// // Redirect logged-in users to their own home, show landing for guests
// const HomeRoute = () => {
//   const { user, isAuthenticated, loading } = useAuth();
//   if (loading) return null;
//   if (!isAuthenticated) return <Home />;

//   const roleHome = {
//     admin:      "/dashboard/admin",
//     counsellor: "/dashboard/counsellor",
//     student:    "/dashboard/student",
//   };
//   return <Navigate to={roleHome[user?.role] || "/dashboard/student"} replace />;
// };

// // Block logged-in users from visiting login/register
// const RedirectIfLoggedIn = ({ children }) => {
//   const { user, isAuthenticated } = useAuth();
//   if (!isAuthenticated) return children;

//   const roleHome = {
//     admin:      "/dashboard/admin",
//     counsellor: "/dashboard/counsellor",
//     student:    "/dashboard/student",
//   };
//   return <Navigate to={roleHome[user?.role] || "/dashboard/student"} replace />;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           {/* ── Public (Landing layout with Navbar/Footer) ── */}
//           <Route element={<LandingLayout />}>
//             <Route path="/" element={<HomeRoute />} />
//             <Route path="/login"    element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
//             <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
//           </Route>

//           {/* ── Student routes ── */}
//           <Route path="/dashboard/student" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Dashboard />
//             </ProtectedRoute>
//           } />
//           <Route path="/dashboard/community" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Community />
//             </ProtectedRoute>
//           } />
//           <Route path="/dashboard/appointments" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Appointments />
//             </ProtectedRoute>
//           } />
//           <Route path="/dashboard/activities" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Activities />
//             </ProtectedRoute>
//           } />
//           <Route path="/dashboard/analytics" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Analytics />
//             </ProtectedRoute>
//           } />
//           <Route path="/dashboard/chatbot" element={
//             <ProtectedRoute allowedRoles={["student"]}>
//               <Chatbot />
//             </ProtectedRoute>
//           } />

//           {/* ── Counsellor routes ── */}
//           <Route path="/dashboard/counsellor" element={
//             <ProtectedRoute allowedRoles={["counsellor"]}>
//               <CounsellorDashboard />
//             </ProtectedRoute>
//           } />

//           {/* ── Admin routes ── */}
//           <Route path="/dashboard/admin" element={
//             <ProtectedRoute allowedRoles={["admin"]}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           } />

//           {/* ── Fallback ── */}
//           <Route path="*" element={<Navigate to="/" />} />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;




import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Landing page
import LandingLayout from "./components/LandingPage/LandingLayout";
import Hero from "./components/LandingPage/Hero";
import GentleInsights from "./components/LandingPage/GentleInsights";
import CoreConnections from "./components/LandingPage/CoreConnections";
import CTA from "./components/LandingPage/CTA";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Role dashboards
import Dashboard from "./pages/Dashboard";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Student sub-pages
import Community from "./pages/Community";
import Appointments from "./pages/Appointments";
import Activities from "./pages/Activities";
import Analytics from "./pages/Analytics";
import Chatbot from "./pages/Chatbot";
import VolunteerChat from "./pages/VolunteerChat";
import ControlledRespiration from "./pages/ControlledRespiration";

const ROLE_HOME = {
  admin: "/dashboard/admin",
  counsellor: "/dashboard/counsellor",
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

// "/" — show landing for guests, redirect logged-in users to their dashboard
const HomeRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;                                     // wait — don't redirect yet
  if (!isAuthenticated) return <Home />;                        // guest → landing page
  return <Navigate to={ROLE_HOME[user.role] || "/"} replace />; // logged in → their home
};

// Wrap login/register — if already logged in, go to dashboard instead
const GuestOnly = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
  return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public (with landing Navbar/Footer) ── */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          </Route>

          {/* ── Student ── */}
          <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={["student"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/community" element={<ProtectedRoute allowedRoles={["student"]}><Community /></ProtectedRoute>} />
          <Route path="/dashboard/appointments" element={<ProtectedRoute allowedRoles={["student"]}><Appointments /></ProtectedRoute>} />
          <Route path="/dashboard/activities" element={<ProtectedRoute allowedRoles={["student"]}><Activities /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={["student"]}><Analytics /></ProtectedRoute>} />
          <Route path="/dashboard/chatbot" element={<ProtectedRoute allowedRoles={["student"]}><Chatbot /></ProtectedRoute>} />
          <Route path="/dashboard/volunteer-chat" element={<ProtectedRoute allowedRoles={["student"]}><VolunteerChat /></ProtectedRoute>} />
          <Route path="/dashboard/controlled-respiration" element={<ProtectedRoute allowedRoles={["student"]}><ControlledRespiration /></ProtectedRoute>} />

          {/* ── Counsellor ── */}
          <Route path="/dashboard/counsellor" element={<ProtectedRoute allowedRoles={["counsellor"]}><CounsellorDashboard /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

          {/* ── Unknown routes → home (NOT a catch-all redirect loop) ── */}
          <Route path="*" element={<HomeRoute />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
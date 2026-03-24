import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import FocusMode from "./pages/FocusMode";
import Performance from "./pages/Performance";
import Suggestions from "./pages/Suggestions";
import Settings from "./pages/Settings";
import Profile from "./pages/profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppStartupLoader from "./components/layout/AppStartupLoader";

function AppRoutes() {
  const location = useLocation();

  const shouldShowStartupLoader = useMemo(() => {
    const authLikePath =
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/signup";

    if (!authLikePath) return false;

    const navEntries = performance.getEntriesByType("navigation");
    const navType =
      navEntries && navEntries.length > 0 ? navEntries[0].type : "navigate";

    return navType === "navigate" || navType === "reload";
  }, [location.pathname]);

  const [booting, setBooting] = useState(() => shouldShowStartupLoader);

  useEffect(() => {
    if (!booting) return;

    const timer = setTimeout(() => {
      setBooting(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [booting]);

  if (shouldShowStartupLoader && booting) {
    return <AppStartupLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/focus"
        element={
          <ProtectedRoute>
            <FocusMode />
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suggestions"
        element={
          <ProtectedRoute>
            <Suggestions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
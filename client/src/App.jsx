import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";
import AdminUsersGate from "./pages/AdminUsersGate.jsx";
import { getToken, clearToken, getUser, setUser, api } from "./api.js";

function Layout({ children }) {
  const token = getToken();
  const [navUser, setNavUser] = useState(() => getUser());

  useEffect(() => {
    if (!token) {
      setNavUser(null);
      return;
    }
    if (getUser()) {
      setNavUser(getUser());
      return;
    }
    let cancelled = false;
    api("/api/auth/me")
      .then((r) => {
        if (!cancelled && r.user) {
          setUser(r.user);
          setNavUser(r.user);
        }
      })
      .catch(() => {
        if (!cancelled) setNavUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isAdmin = navUser?.role === "admin";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #cbd5e1",
        }}
      >
        <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/records">Records</Link>
          {isAdmin && (
            <Link to="/admin/users" style={{ fontWeight: 600 }}>
              Admin: Users
            </Link>
          )}
        </nav>
        {token && (
          <button
            type="button"
            onClick={() => {
              clearToken();
              window.location.href = "/login";
            }}
          >
            Log out
          </button>
        )}
      </header>
      {children}
    </div>
  );
}

function PrivateRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/records"
        element={
          <PrivateRoute>
            <RecordsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminUsersGate />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, getUser, setUser } from "../api.js";
import UsersAdminPage from "./UsersAdminPage.jsx";

/**
 * Ensures /api/auth/me has run when only a token exists, then allows admin only.
 */
export default function AdminUsersGate() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getUser()) {
        try {
          const r = await api("/api/auth/me");
          if (!cancelled && r.user) setUser(r.user);
        } catch {
          if (!cancelled) setStatus("denied");
          return;
        }
      }
      if (!cancelled) setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return <p>Checking access…</p>;
  if (getUser()?.role !== "admin") return <Navigate to="/" replace />;
  return <UsersAdminPage />;
}

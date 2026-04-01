import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, setUser } from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      if (data.user) setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.body?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Finance Dashboard</h1>
      <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
        Sign in with your account. Use the seeded admin from the README, or an account your admin
        created.
      </p>
      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          background: "#fff",
          padding: "1.5rem",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
        }}
      >
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>
        {error && <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

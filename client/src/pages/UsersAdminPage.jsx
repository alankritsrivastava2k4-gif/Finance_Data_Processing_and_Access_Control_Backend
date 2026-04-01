import { useEffect, useState } from "react";
import { api, getUser } from "../api.js";

const ROLES = ["viewer", "analyst", "admin"];
const STATUSES = ["active", "inactive"];

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "viewer",
    status: "active",
  });

  const currentId = getUser()?.id;

  async function load() {
    setError("");
    try {
      const res = await api("/api/users");
      setUsers(res.users || []);
    } catch (e) {
      setError(e.body?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ email: "", password: "", name: "", role: "viewer", status: "active" });
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    } finally {
      setCreating(false);
    }
  }

  async function patchUser(id, patch) {
    setError("");
    try {
      await api(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    }
  }

  async function removeUser(id) {
    if (!window.confirm("Delete this user? They will no longer be able to sign in.")) return;
    setError("");
    try {
      await api(`/api/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    }
  }

  if (loading) return <p>Loading users…</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>User management (admin)</h1>
      <p style={{ color: "#475569" }}>
        Create users, assign roles (viewer / analyst / admin), and set status. Only admins can access
        this page.
      </p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <section
        style={{
          background: "#fff",
          padding: "1rem",
          borderRadius: 8,
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create user</h2>
        <form
          onSubmit={handleCreate}
          style={{ display: "grid", gap: "0.5rem", maxWidth: 420 }}
        >
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            Password (min 8 chars)
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              style={{ width: "100%", marginTop: 4, padding: 8 }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              style={{ width: "100%", marginTop: 4, padding: 8 }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create user"}
          </button>
        </form>
      </section>

      <section>
        <h2>All users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>{u.name}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.role}
                    onChange={(e) => patchUser(u.id, { role: e.target.value })}
                    style={{ padding: 4 }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.status}
                    onChange={(e) => patchUser(u.id, { status: e.target.value })}
                    style={{ padding: 4 }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <button
                    type="button"
                    disabled={u.id === currentId}
                    onClick={() => removeUser(u.id)}
                    style={{ color: u.id === currentId ? "#94a3b8" : "#b91c1c" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

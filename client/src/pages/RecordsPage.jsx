import { useEffect, useState, useCallback } from "react";
import { api, getUser } from "../api.js";

function toIsoDateInput(d) {
  const x = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

const emptyForm = () => ({
  amount: "",
  type: "expense",
  category: "",
  date: toIsoDateInput(new Date()),
  notes: "",
});

export default function RecordsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const user = getUser();
  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api("/api/records?limit=50");
      setData(res);
    } catch (e) {
      setError(
        e.status === 403
          ? "Your role (viewer) cannot list raw records. Analysts and admins can."
          : e.body?.message || e.message
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/records", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(form.amount),
          type: form.type,
          category: form.category.trim(),
          date: new Date(form.date).toISOString(),
          notes: form.notes || "",
        }),
      });
      setForm(emptyForm());
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(row) {
    setEditingId(row._id);
    setForm({
      amount: String(row.amount),
      type: row.type,
      category: row.category,
      date: toIsoDateInput(row.date),
      notes: row.notes || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      await api(`/api/records/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          amount: Number(form.amount),
          type: form.type,
          category: form.category.trim(),
          date: new Date(form.date).toISOString(),
          notes: form.notes || "",
        }),
      });
      cancelEdit();
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Soft-delete this record? It will be excluded from totals.")) return;
    setError("");
    try {
      await api(`/api/records/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(e.body?.message || e.message);
    }
  }

  if (loading) return <p>Loading records…</p>;
  if (error && !data) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Financial records</h1>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Financial records</h1>
      <p style={{ color: "#475569" }}>
        {isAdmin
          ? "As admin you can create, update, and soft-delete entries below. Analysts can only view this list."
          : "Paginated list. Only admins can create, update, or delete records from the UI."}
      </p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {isAdmin && (
        <section
          style={{
            background: "#fff",
            padding: "1rem",
            borderRadius: 8,
            marginBottom: "1.5rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{editingId ? "Edit record" : "Create record"}</h2>
          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            style={{ display: "grid", gap: "0.5rem", maxWidth: 480 }}
          >
            <label>
              Amount
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                style={{ width: "100%", marginTop: 4, padding: 8 }}
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                style={{ width: "100%", marginTop: 4, padding: 8 }}
              >
                <option value="income">income</option>
                <option value="expense">expense</option>
              </select>
            </label>
            <label>
              Category
              <input
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                style={{ width: "100%", marginTop: 4, padding: 8 }}
              />
            </label>
            <label>
              Date
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ width: "100%", marginTop: 4, padding: 8 }}
              />
            </label>
            <label>
              Notes
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%", marginTop: 4, padding: 8 }}
              />
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <p style={{ fontSize: 14 }}>
        Page {data.pagination.page} of {data.pagination.totalPages} (total {data.pagination.total}
        )
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: 8 }}>Date</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}>Category</th>
            <th style={{ padding: 8 }}>Amount</th>
            <th style={{ padding: 8 }}>Notes</th>
            {isAdmin && <th style={{ padding: 8 }}>Admin</th>}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row) => (
            <tr key={row._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: 8 }}>{new Date(row.date).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{row.type}</td>
              <td style={{ padding: 8 }}>{row.category}</td>
              <td style={{ padding: 8 }}>{row.amount.toFixed(2)}</td>
              <td style={{ padding: 8 }}>{row.notes}</td>
              {isAdmin && (
                <td style={{ padding: 8 }}>
                  <button type="button" onClick={() => startEdit(row)} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(row._id)} style={{ color: "#b91c1c" }}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

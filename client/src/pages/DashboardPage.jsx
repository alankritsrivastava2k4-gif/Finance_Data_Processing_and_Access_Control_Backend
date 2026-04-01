import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api("/api/dashboard/summary?trend=weekly");
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.body?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading summary…</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>;
  if (!data) return null;

  const { totals, categoryWise, recentActivity } = data;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: "#475569" }}>
        Aggregated totals and category breakdowns. All authenticated roles can view this screen.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Stat label="Total income" value={totals.totalIncome} positive />
        <Stat label="Total expenses" value={totals.totalExpenses} />
        <Stat label="Net balance" value={totals.netBalance} highlight />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>By category</h2>
        <ul style={{ paddingLeft: "1.25rem" }}>
          {categoryWise.map((row) => (
            <li key={`${row.category}-${row.type}`}>
              <strong>{row.category}</strong> ({row.type}): {row.total.toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Recent activity</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Type</th>
              <th style={{ padding: 8 }}>Category</th>
              <th style={{ padding: 8 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((row) => (
              <tr key={row._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>{new Date(row.date).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{row.type}</td>
                <td style={{ padding: 8 }}>{row.category}</td>
                <td style={{ padding: 8 }}>{row.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value, positive, highlight }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "1rem",
        borderRadius: 8,
        border: highlight ? "2px solid #2563eb" : "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: positive ? "#15803d" : highlight ? "#1d4ed8" : "#0f172a",
        }}
      >
        {value.toFixed(2)}
      </div>
    </div>
  );
}

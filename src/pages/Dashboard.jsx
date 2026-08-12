import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_LABELS = {
  contacted: "New contact",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/workers/me/dashboard").then((res) => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleAvailability = async () => {
    setSaving(true);
    try {
      const res = await api.put("/workers/me", { isAvailable: !user.isAvailable });
      setUser(res.data.worker);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (logId, status) => {
    await api.put(`/workers/contact/${logId}/status`, { status });
    load();
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setSaving(true);
      try {
        const res = await api.put("/workers/me", { lng: pos.coords.longitude, lat: pos.coords.latitude });
        setUser(res.data.worker);
      } finally {
        setSaving(false);
      }
    });
  };

  if (loading || !data) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-yard-500">Loading dashboard...</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow mb-2">Worker dashboard</p>
      <h1 className="mb-8 font-display text-2xl font-semibold text-yard-950">Welcome back, {user.name.split(" ")[0]}</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Times contacted", value: data.contactCount },
          { label: "Jobs completed", value: data.jobsCompleted },
          { label: "Rating", value: data.ratingAvg?.toFixed?.(1) ?? "0.0" },
          { label: "Reviews", value: data.ratingCount },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="font-mono text-xl font-semibold text-yard-950">{s.value}</p>
            <p className="text-xs text-yard-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card mb-8 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-semibold text-yard-950">
            You're currently {user.isAvailable ? "visible to clients" : "hidden from search"}
          </p>
          <p className="text-xs text-yard-500">Toggle off when you're fully booked or off duty.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshLocation} disabled={saving} className="btn-outline text-sm">Update my location</button>
          <button onClick={toggleAvailability} disabled={saving} className={user.isAvailable ? "btn-outline text-sm" : "btn-primary text-sm"}>
            {user.isAvailable ? "Go offline" : "Go available"}
          </button>
        </div>
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-yard-950">Recent contacts</h2>
      {data.recentContacts.length === 0 && (
        <p className="text-sm text-yard-500">No contacts yet — clients who call or WhatsApp you show up here.</p>
      )}
      <div className="space-y-3">
        {data.recentContacts.map((log) => (
          <div key={log._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-yard-900">
                {log.method === "call" ? "Phone call" : "WhatsApp message"} · {new Date(log.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-yard-500">Status: {STATUS_LABELS[log.status]}</p>
            </div>
            <select
              value={log.status}
              onChange={(e) => updateStatus(log._id, e.target.value)}
              className="input !w-auto text-sm"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

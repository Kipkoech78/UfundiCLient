import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/* ---------- helpers ---------- */
const fmt = (n) => (n ?? 0).toLocaleString("en-KE");
const fdate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const ago = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const niceMax = (v) => {
  const m = 10 ** Math.floor(Math.log10(v));
  const f = v / m;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * m;
};

const ICONS = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  traffic: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  refresh: "M21 12a9 9 0 1 1-3-6.7L21 8 M21 3v5h-5",
  ext: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M21 21l-4.3-4.3",
};
const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={ICONS[name]} />
  </svg>
);

/* ---------- building blocks ---------- */
function Kpi({ label, value, sub, live }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-yard-600">{label}</p>
        {live && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal-green" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-yard-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-yard-600">{sub}</p>}
    </div>
  );
}

function Card({ title, sub, children, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-yard-950">{title}</h3>
        {sub && <p className="text-xs text-yard-600">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Bars({ items = [], color = "bg-amber-500" }) {
  if (!items.length) return <p className="py-8 text-center text-sm text-yard-400">No data yet</p>;
  const max = Math.max(1, ...items.map((i) => i.n));
  const total = items.reduce((a, b) => a + b.n, 0) || 1;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="truncate pr-3 text-yard-700">{i.label}</span>
            <span className="shrink-0 font-mono text-xs text-yard-600">{fmt(i.n)} · {Math.round((i.n / total) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-yard-100">
            <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(i.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Chart({ data, series, height = 240 }) {
  const [hover, setHover] = useState(null);
  const W = 720, H = height, L = 34, R = 10, T = 10, B = 26;
  const max = niceMax(Math.max(4, ...data.flatMap((d) => series.map((s) => d[s.key]))));
  const span = Math.max(data.length - 1, 1);
  const x = (i) => L + (i * (W - L - R)) / span;
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const line = (k) => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join("");
  const step = Math.ceil(data.length / 7);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.min(Math.max(Math.round(((px - L) / (W - L - R)) * span), 0), data.length - 1));
  };
  const hd = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(max * t)} y2={y(max * t)} stroke="#EDEFF1" />
            <text x={L - 6} y={y(max * t) + 3} textAnchor="end" fontSize="10" fill="#8C97A3">{Math.round(max * t)}</text>
          </g>
        ))}
        {data.map((d, i) => i % step === 0 && (
          <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8C97A3">{fdate(d.date)}</text>
        ))}
        <path d={`${line(series[0].key)}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={`url(#g-${series[0].key})`} />
        {series.map((s) => (
          <path key={s.key} d={line(s.key)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hd && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#8C97A3" strokeDasharray="3 3" />
            {series.map((s) => <circle key={s.key} cx={x(hover)} cy={y(hd[s.key])} r="4" fill="#fff" stroke={s.color} strokeWidth="2" />)}
          </g>
        )}
      </svg>
      {hd && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md bg-yard-950 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `${Math.min(Math.max((x(hover) / W) * 100, 12), 88)}%` }}
        >
          <p className="mb-1 font-semibold">{fdate(hd.date)}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}: <b>{fmt(hd[s.key])}</b>
            </p>
          ))}
        </div>
      )}
      {series.length > 1 && (
        <div className="mt-2 flex gap-4 text-xs text-yard-600">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const Badge = ({ children, tone = "gray" }) => {
  const tones = {
    gray: "bg-yard-100 text-yard-700",
    green: "bg-signal-green/10 text-signal-green",
    amber: "bg-amber-400/20 text-amber-600",
    dark: "bg-yard-900 text-yard-50",
    red: "bg-signal-red/10 text-signal-red",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
};

/* ---------- tabs ---------- */
function Overview({ s }) {
  const t = s.traffic;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Online now" value={fmt(t.online)} sub="Active in the last 2 min" live />
        <Kpi label="Daily active users" value={fmt(t.dau)} sub={`${fmt(t.wau)} weekly · ${fmt(t.mau)} monthly`} />
        <Kpi label="Total users" value={fmt(s.users.total)} sub={`${fmt(s.users.workers)} fundis · ${fmt(s.users.clients)} clients`} />
        <Kpi label="Contact requests" value={fmt(s.contacts.total)} sub={`${fmt(s.users.jobsCompleted)} jobs completed`} />
        <Kpi label={`Page views (${s.days}d)`} value={fmt(t.views)} sub={`${fmt(t.today.views)} today`} />
        <Kpi label={`Unique visitors (${s.days}d)`} value={fmt(t.visitors)} sub={`${t.pagesPerSession} pages / session`} />
        <Kpi label="Verified fundis" value={fmt(s.users.verified)} sub={`${fmt(s.users.pending)} awaiting verification`} />
        <Kpi label="Average rating" value={s.reviews.avg || "–"} sub={`${fmt(s.reviews.total)} reviews`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Traffic" sub="Page views and unique visitors per day" className="lg:col-span-2">
          <Chart data={s.series} series={[{ key: "views", label: "Page views", color: "#E89417" }, { key: "visitors", label: "Visitors", color: "#1B232D" }]} />
        </Card>
        <Card title="Top pages" sub={`Last ${s.days} days`}><Bars items={t.pages} /></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="New signups" sub="Fundis vs clients per day" className="lg:col-span-2">
          <Chart height={200} data={s.series} series={[{ key: "workers", label: "Fundis", color: "#2F8F5B" }, { key: "clients", label: "Clients", color: "#E89417" }]} />
        </Card>
        <Card title="Fundis by trade"><Bars items={s.users.categories} color="bg-signal-green" /></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent signups">
          <ul className="divide-y divide-yard-100">
            {s.recent.users.map((u) => (
              <li key={u._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-yard-900">{u.name}</p>
                  <p className="text-xs text-yard-600">{u.role === "worker" ? u.category || "Fundi" : "Client"}</p>
                </div>
                <span className="text-xs text-yard-400">{ago(u.createdAt)}</span>
              </li>
            ))}
            {!s.recent.users.length && <p className="py-6 text-center text-sm text-yard-400">No signups yet</p>}
          </ul>
        </Card>
        <Card title="Recent contact requests">
          <ul className="divide-y divide-yard-100">
            {s.recent.contacts.map((c) => (
              <li key={c._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-yard-900">{c.client?.name || "Guest"} → {c.worker?.name || "Removed fundi"}</p>
                  <p className="text-xs text-yard-600">via {c.method} · {c.status.replace("_", " ")}</p>
                </div>
                <span className="text-xs text-yard-400">{ago(c.createdAt)}</span>
              </li>
            ))}
            {!s.recent.contacts.length && <p className="py-6 text-center text-sm text-yard-400">No contacts yet</p>}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Traffic({ s }) {
  const t = s.traffic;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Online now" value={fmt(t.online)} sub="Active in the last 2 min" live />
        <Kpi label="Daily active users" value={fmt(t.dau)} sub="Unique visitors today" />
        <Kpi label="Weekly active" value={fmt(t.wau)} sub="Last 7 days" />
        <Kpi label="Monthly active" value={fmt(t.mau)} sub={`Stickiness (DAU/MAU): ${t.stickiness}%`} />
        <Kpi label="Views today" value={fmt(t.today.views)} />
        <Kpi label={`Page views (${s.days}d)`} value={fmt(t.views)} />
        <Kpi label="Sessions" value={fmt(t.sessions)} sub={`Last ${s.days} days`} />
        <Kpi label="Pages / session" value={t.pagesPerSession} sub="Engagement depth" />
      </div>
      <Card title="Daily active users" sub="Unique visitors per day (Nairobi time)">
        <Chart data={s.series} series={[{ key: "visitors", label: "Daily active users", color: "#E89417" }]} />
      </Card>
      <Card title="Page views" sub="Total pages viewed per day">
        <Chart height={200} data={s.series} series={[{ key: "views", label: "Page views", color: "#1B232D" }]} />
      </Card>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Top pages"><Bars items={t.pages} /></Card>
        <Card title="Devices"><Bars items={t.devices} color="bg-yard-800" /></Card>
        <Card title="Browsers"><Bars items={t.browsers} color="bg-yard-600" /></Card>
        <Card title="Referrers" sub="External sites sending traffic"><Bars items={t.referrers} color="bg-signal-green" /></Card>
      </div>
    </>
  );
}

function UsersTab() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  const load = useCallback(
    () => api.get("/admin/users", { params: { q, role, page } }).then((r) => setData(r.data)),
    [q, role, page]
  );
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const patch = async (u, body) => { await api.patch(`/admin/users/${u._id}`, body); load(); };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This also removes their reviews and contact history.`)) return;
    await api.delete(`/admin/users/${u._id}`);
    load();
  };

  return (
    <Card title="Users" sub={data ? `${fmt(data.total)} matching accounts` : "Loading…"}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yard-400" />
          <input className="input !pl-9" placeholder="Search name, email or phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="input sm:w-44" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="worker">Fundis</option>
          <option value="client">Clients</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-yard-200 font-display text-xs uppercase tracking-wide text-yard-600">
              <th className="py-2 pr-3">User</th><th className="pr-3">Role</th><th className="pr-3">Trade / Phone</th>
              <th className="pr-3">Status</th><th className="pr-3">Joined</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yard-100">
            {data?.items.map((u) => (
              <tr key={u._id}>
                <td className="py-3 pr-3">
                  <p className="font-medium text-yard-900">{u.name}</p>
                  <p className="text-xs text-yard-600">{u.email}</p>
                </td>
                <td className="pr-3"><Badge tone={u.role === "admin" ? "dark" : u.role === "worker" ? "amber" : "gray"}>{u.role}</Badge></td>
                <td className="pr-3 text-yard-700">{u.role === "worker" ? u.category || "—" : u.phone}</td>
                <td className="pr-3">
                  {u.role === "worker" ? (
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={u.isVerified ? "green" : "red"}>{u.isVerified ? "Verified" : "Unverified"}</Badge>
                      <Badge tone={u.isAvailable ? "green" : "gray"}>{u.isAvailable ? "Available" : "Busy"}</Badge>
                    </div>
                  ) : <span className="text-yard-400">—</span>}
                </td>
                <td className="pr-3 text-xs text-yard-600">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="space-x-2 text-right">
                  {u.role === "worker" && (
                    <button className="btn-outline !px-3 !py-1.5 text-xs" onClick={() => patch(u, { isVerified: !u.isVerified })}>
                      {u.isVerified ? "Unverify" : "Verify"}
                    </button>
                  )}
                  {u.role !== "admin" && (
                    <button className="btn-outline !px-3 !py-1.5 text-xs !text-signal-red" onClick={() => remove(u)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.items.length && <p className="py-10 text-center text-sm text-yard-400">No users found</p>}
      </div>

      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-yard-600">
          <span>Page {data.page} of {data.pages}</span>
          <div className="space-x-2">
            <button className="btn-outline !px-3 !py-1.5 text-xs" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn-outline !px-3 !py-1.5 text-xs" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- shell ---------- */
const NAV = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "traffic", label: "Traffic & Visits", icon: "traffic" },
  { id: "users", label: "Users", icon: "users" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [spin, setSpin] = useState(false);

  const load = useCallback(() => {
    setSpin(true);
    return api.get("/admin/stats", { params: { days } })
      .then((r) => { setStats(r.data); setErr(""); })
      .catch((e) => setErr(e.response?.data?.message || "Could not load stats"))
      .finally(() => setSpin(false));
  }, [days]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // live refresh
    return () => clearInterval(t);
  }, [load]);

  const current = NAV.find((n) => n.id === tab);

  return (
    <div className="flex min-h-screen bg-yard-100/70 font-body text-yard-900">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-yard-950 text-yard-200 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 font-display text-sm font-bold text-yard-950">UH</span>
          <span className="font-display text-lg font-semibold text-white">UfundiHome</span>
          <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber-300">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => { setTab(n.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${tab === n.id ? "bg-amber-500 text-yard-950" : "hover:bg-white/5 hover:text-white"}`}
            >
              <Icon name={n.icon} />{n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="mb-3 truncate text-xs text-yard-400">{user.email}</p>
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 text-sm text-yard-200 hover:text-white">
            <Icon name="out" className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-yard-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold text-yard-950">{current.label}</h1>
            <p className="hidden text-xs text-yard-600 sm:block">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {stats && (
            <span className="hidden items-center gap-2 rounded-full bg-signal-green/10 px-3 py-1 text-xs font-semibold text-signal-green sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-signal-green" />{fmt(stats.traffic.online)} online
            </span>
          )}
          {tab !== "users" && (
            <select className="input !w-auto !py-1.5" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[7, 14, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}
            </select>
          )}
          <button onClick={load} className="rounded-md border border-yard-200 p-2 text-yard-600 hover:text-yard-950" aria-label="Refresh">
            <Icon name="refresh" className={`h-4 w-4 ${spin ? "animate-spin" : ""}`} />
          </button>
          <Link to="/" target="_blank" className="hidden items-center gap-1.5 text-sm font-medium text-yard-700 hover:text-yard-950 md:flex">
            View site <Icon name="ext" className="h-4 w-4" />
          </Link>
        </header>

        <main className="space-y-6 p-4 sm:p-6">
          {err && <div className="rounded-md border border-signal-red/30 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{err}</div>}
          {tab === "users" ? <UsersTab /> : !stats ? (
            !err && <p className="py-20 text-center text-yard-400">Loading analytics…</p>
          ) : tab === "overview" ? <Overview s={stats} /> : <Traffic s={stats} />}
        </main>
      </div>
    </div>
  );
}

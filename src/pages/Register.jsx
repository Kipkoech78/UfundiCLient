import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  "Plumber", "Electrician", "Fitter", "Fixer / Handyman", "Painter",
  "General Contractor", "Metalworker / Welder", "Carpenter", "Mason", "Roofer",
  "Mover / Casual Labour", "Other",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", whatsapp: "",
    category: "Plumber", bio: "", yearsExperience: 1, address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finishRegister = async (coords) => {
      try {
        const user = await register({ ...form, role, lng: coords?.lng, lat: coords?.lat });
        navigate(user.role === "worker" ? "/dashboard" : "/workers");
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finishRegister({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => finishRegister(null)
      );
    } else {
      finishRegister(null);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="eyebrow mb-2">Join UfundiHome</p>
      <h1 className="mb-6 font-display text-2xl font-semibold text-yard-950">Create your account</h1>

      <div className="mb-6 flex rounded-md border border-yard-200 bg-white p-1">
        {["client", "worker"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            type="button"
            className={`flex-1 rounded px-3 py-2 text-sm font-medium capitalize transition ${
              role === r ? "bg-yard-950 text-white" : "text-yard-600 hover:text-yard-950"
            }`}
          >
            {r === "client" ? "I need a fundi" : "I am a fundi"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.name} onChange={update("name")} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={update("email")} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={6} className="input" value={form.password} onChange={update("password")} />
        </div>
        <div>
          <label className="label">Phone number</label>
          <input required placeholder="07XXXXXXXX" className="input" value={form.phone} onChange={update("phone")} />
        </div>
        <div>
          <label className="label">WhatsApp number (optional, defaults to phone)</label>
          <input placeholder="07XXXXXXXX" className="input" value={form.whatsapp} onChange={update("whatsapp")} />
        </div>

        {role === "worker" && (
          <>
            <div>
              <label className="label">Trade / Category</label>
              <select className="input" value={form.category} onChange={update("category")}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Years of experience</label>
              <input type="number" min="0" className="input" value={form.yearsExperience} onChange={update("yearsExperience")} />
            </div>
            <div>
              <label className="label">Short bio</label>
              <textarea className="input min-h-[80px]" placeholder="Tell clients about your work..." value={form.bio} onChange={update("bio")} />
            </div>
          </>
        )}

        <div>
          <label className="label">Area / Estate (optional)</label>
          <input placeholder="e.g. Westlands, Nairobi" className="input" value={form.address} onChange={update("address")} />
        </div>

        <p className="text-xs text-yard-500">
          We'll ask for your location to show you {role === "worker" ? "to nearby clients" : "nearby fundis"} — allow it when prompted.
        </p>

        {error && <p className="text-sm text-signal-red">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>

      <p className="mt-5 text-center text-sm text-yard-600">
        Already have an account? <Link to="/login" className="font-medium text-amber-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}

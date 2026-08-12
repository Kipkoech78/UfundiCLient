import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "worker" ? "/dashboard" : "/workers");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="mb-8 font-display text-2xl font-semibold text-yard-950">Log in to UfundiHome</h1>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="text-sm text-signal-red">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      </form>

      <p className="mt-5 text-center text-sm text-yard-600">
        No account? <Link to="/register" className="font-medium text-amber-600 hover:underline">Create one</Link>
      </p>
    </div>
  );
}

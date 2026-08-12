import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryGrid from "../components/CategoryGrid.jsx";
import RadarDot from "../components/RadarDot.jsx";
import { SUPPORT, telHref } from "../api/api.js";

export default function Home() {
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);

  const findNearMe = () => {
    if (!navigator.geolocation) return navigate("/workers");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        navigate(`/workers?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      },
      () => {
        setLocating(false);
        navigate("/workers");
      }
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-yard-950">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,148,23,0.25) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }} />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="eyebrow mb-4">Nairobi · Kiambu · Machakos · Kajiado</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
            Find a fundi near you. <span className="text-amber-400">Call in seconds.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-yard-300 sm:text-lg">
            Plumbers, electricians, painters, fitters, metalworkers and general contractors — ranked by distance to
            you, rated by real clients, one tap to call or WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={findNearMe} disabled={locating} className="btn-primary">
              <RadarDot size="sm" />
              {locating ? "Finding your location..." : "Find fundis near me"}
            </button>
            <button onClick={() => navigate("/register")} className="btn-outline !border-yard-700 !bg-transparent !text-white hover:!border-amber-500">
              Register as a fundi
            </button>
          </div>

          <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-yard-800 pt-8">
            <div>
              <p className="font-mono text-2xl font-semibold text-white">10+</p>
              <p className="text-xs text-yard-400">Trades covered</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white">Live</p>
              <p className="text-xs text-yard-400">Proximity ranking</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white">1 tap</p>
              <p className="text-xs text-yard-400">Call or WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Browse by trade</p>
            <h2 className="font-display text-2xl font-semibold text-yard-950">What do you need done?</h2>
          </div>
        </div>
        <CategoryGrid />
      </section>

      {/* How it works */}
      <section className="bg-yard-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="mb-10 font-display text-2xl font-semibold text-yard-950">
            Same as calling a taxi — but for the fundi at your gate
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Share your location", body: "We rank available fundis in your trade by distance from you, nearest first." },
              { step: "02", title: "Check ratings & contacts", body: "See real client reviews and how often each fundi gets contacted for jobs." },
              { step: "03", title: "Call or WhatsApp instantly", body: "Tap to call or message — no middleman, you speak to the fundi directly." },
            ].map((s) => (
              <div key={s.step}>
                <p className="font-mono text-sm font-semibold text-amber-600">{s.step}</p>
                <h3 className="mt-2 font-display text-lg font-semibold text-yard-950">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-yard-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support strip */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-1">Need help?</p>
            <p className="font-display text-lg font-semibold text-yard-950">Our support team is on standby</p>
          </div>
          <a href={telHref(SUPPORT.phone)} className="btn-dark">
            Call support · {SUPPORT.phone}
          </a>
        </div>
      </section>
    </div>
  );
}

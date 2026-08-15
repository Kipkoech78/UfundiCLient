import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api.js";
import WorkerCard from "../components/WorkerCard.jsx";
import RadarDot from "../components/RadarDot.jsx";

const CATEGORIES = [
  "Plumber", "Electrician", "Fitter", "Fixer / Handyman", "Painter",
  "General Contractor", "Metalworker / Welder", "Carpenter", "Mason", "Roofer",
  "Mover / Casual Labour", "Other",
];

export default function Workers() {
  const [params, setParams] = useSearchParams();
  const [coords, setCoords] = useState(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    return lat && lng ? { lat: +lat, lng: +lng } : null;
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState("distance");
  const [radius, setRadius] = useState(15);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
// add near the top of Workers.jsx
const [manualQuery, setManualQuery] = useState("");
const [geocoding, setGeocoding] = useState(false);

const searchManualLocation = async () => {
  if (!manualQuery.trim()) return;
  setGeocoding(true);
  setLocError("");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ke&q=${encodeURIComponent(manualQuery)}`
    );
    const results = await res.json();
    if (results.length === 0) {
      setLocError("Couldn't find that place. Try a nearby town or estate name.");
      return;
    }
    setCoords({ lat: +results[0].lat, lng: +results[0].lon });
  } catch {
    setLocError("Location search failed — check your connection.");
  } finally {
    setGeocoding(false);
  }
};
  // const locate = useCallback(() => {
  //   if (!navigator.geolocation) {
  //     setLocError("Geolocation isn't supported on this device. Showing Nairobi CBD as default.");
  //     setCoords({ lat: -1.2921, lng: 36.8219 });
  //     return;
  //   }
  //   setLocating(true);
  //   setLocError("");
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  //       setLocating(false);
  //     },
  //     () => {
  //       setLocError("Location access denied. Showing Nairobi CBD as default — allow location for accurate results.");
  //       setCoords({ lat: -1.2921, lng: 36.8219 });
  //       setLocating(false);
  //     }
  //   );
  // }, []);
  const locate = useCallback(() => {
  if (!navigator.geolocation) {
    setLocError("Geolocation isn't supported on this device — search for your location below.");
    return;
  }
  setLocating(true);
  setLocError("");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLocating(false);
    },
    () => {
      setLocError("Couldn't detect your location precisely — search for your area below.");
      setLocating(false);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}, []);

  useEffect(() => {
    if (!coords) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError("");
    api
      .get("/workers/nearby", {
        params: { lat: coords.lat, lng: coords.lng, radiusKm: radius, category: category || undefined, sort },
      })
      .then((res) => setWorkers(res.data.workers))
      .catch(() => setError("Couldn't load fundis right now. Check that the API server is running."))
      .finally(() => setLoading(false));
  }, [coords, category, sort, radius]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Fundis near you</p>
          <h1 className="font-display text-2xl font-semibold text-yard-950 sm:text-3xl">
            {category || "All trades"}
          </h1>
        </div>
        <button onClick={locate} disabled={locating} className="btn-outline text-sm">
          <RadarDot size="sm" />
          {locating ? "Locating..." : "Refresh my location"}
        </button>
      </div>

      {/* {locError && (
        <p className="mb-6 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-700">
          {locError}

        </p>
      )} */}
      {/* place this under the locError banner */}
{locError && (
  <div className="mb-6 flex flex-col gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 sm:flex-row sm:items-center">
    <input
      className="input flex-1"
      placeholder="Type your town/estate instead, e.g. Nakuru, Eldoret..."
      value={manualQuery}
      onChange={(e) => setManualQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && searchManualLocation()}
    />
    <button onClick={searchManualLocation} disabled={geocoding} className="btn-outline text-sm whitespace-nowrap">
      {geocoding ? "Searching..." : "Use this place"}
    </button>
  </div>
)}

      {/* Filters */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Trade</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All trades</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Sort by</label>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="distance">Nearest first</option>
            <option value="contacts">Most contacted</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        <div>
          <label className="label">Radius: {radius} km</label>
          <input
            type="range" min="1" max="500" value={radius}
            onChange={(e) => setRadius(+e.target.value)}
            className="mt-3 w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Results */}
      {loading && <p className="py-10 text-center text-yard-500">Searching nearby fundis...</p>}
      {error && <p className="py-10 text-center text-signal-red">{error}</p>}
      {!loading && !error && workers.length === 0 && (
        <p className="py-10 text-center text-yard-500">
          No fundis found in this radius. Try increasing the radius or removing the trade filter.
        </p>
      )}

      <div className="space-y-3">
        {workers.map((w) => (
          <WorkerCard key={w._id} worker={w} coords={coords} />
        ))}
      </div>
    </div>
  );
}

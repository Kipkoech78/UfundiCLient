import { Link } from "react-router-dom";
import StarRating from "./StarRating.jsx";
import RadarDot from "./RadarDot.jsx";
import api, { telHref, waHref } from "../api/api.js";

export default function WorkerCard({ worker, coords }) {
  const initials = worker.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const logContact = async (method) => {
    try {
      await api.post(`/workers/${worker._id}/contact`, {
        method,
        lng: coords?.lng,
        lat: coords?.lat,
      });
    } catch (err) {
      // non-blocking - the call/whatsapp link still opens even if logging fails
      console.warn("contact log failed", err.message);
    }
  };

  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <Link to={`/workers/${worker._id}`} className="flex flex-1 items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yard-900 font-display text-sm font-semibold text-amber-400">
            {initials}
          </div>
          {worker.isAvailable && (
            <span className="absolute -bottom-0.5 -right-0.5">
              <RadarDot size="sm" color="green" />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display font-semibold text-yard-950">{worker.name}</h3>
            {worker.isVerified && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-yard-600">{worker.category} · {worker.location?.address || "Nairobi"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <StarRating value={worker.ratingAvg} count={worker.ratingCount} />
            <span className="text-yard-400">·</span>
            <span className="text-yard-500">{worker.jobsCompleted} jobs done</span>
            {worker.contactCount > 0 && (
              <>
                <span className="text-yard-400">·</span>
                <span className="text-yard-500">{worker.contactCount} contacts</span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {typeof worker.distanceKm === "number" && (
          <span className="self-start rounded-md bg-yard-100 px-2.5 py-1 font-mono text-xs font-semibold text-yard-700 sm:self-end">
            {worker.distanceKm} km away
          </span>
        )}
        <div className="flex gap-2">
          <a
            href={telHref(worker.phone)}
            onClick={() => logContact("call")}
            className="btn-dark !px-4 !py-2 text-sm"
          >
            Call
          </a>
          <a
            href={waHref(worker.whatsapp || worker.phone, `Hi ${worker.name}, I found you on UfundiHome and need a ${worker.category?.toLowerCase()}.`)}
            onClick={() => logContact("whatsapp")}
            target="_blank"
            rel="noreferrer"
            className="btn-primary !px-4 !py-2 text-sm"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

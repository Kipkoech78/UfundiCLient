import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { telHref, waHref } from "../api/api.js";
import StarRating from "../components/StarRating.jsx";
import RadarDot from "../components/RadarDot.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function WorkerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/workers/${id}`)
      .then((res) => { setWorker(res.data.worker); setReviews(res.data.reviews); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const logContact = (method) => {
    api.post(`/workers/${id}/contact`, { method }).catch(() => {});
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      setComment("");
      setMsg("Thanks — your review has been posted.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Couldn't post review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-yard-500">Loading profile...</p>;
  if (!worker) return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-yard-500">Fundi not found.</p>;

  const initials = worker.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/workers" className="mb-6 inline-block text-sm text-yard-600 hover:text-yard-950">← Back to search</Link>

      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yard-900 font-display text-lg font-semibold text-amber-400">
                {initials}
              </div>
              {worker.isAvailable && <span className="absolute -bottom-0.5 -right-0.5"><RadarDot size="sm" color="green" /></span>}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-semibold text-yard-950">{worker.name}</h1>
                {worker.isVerified && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600">Verified</span>
                )}
              </div>
              <p className="text-sm text-yard-600">{worker.category} · {worker.location?.address || "Nairobi"}</p>
              <div className="mt-1"><StarRating value={worker.ratingAvg} count={worker.ratingCount} /></div>
            </div>
          </div>

          <div className="flex gap-2">
            <a href={telHref(worker.phone)} onClick={() => logContact("call")} className="btn-dark !px-4 !py-2 text-sm">Call</a>
            <a
              href={waHref(worker.whatsapp || worker.phone, `Hi ${worker.name}, I found you on UfundiHome and need a ${worker.category?.toLowerCase()}.`)}
              onClick={() => logContact("whatsapp")}
              target="_blank" rel="noreferrer"
              className="btn-primary !px-4 !py-2 text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-yard-100 pt-5 text-center">
          <div><p className="font-mono text-lg font-semibold text-yard-950">{worker.yearsExperience}</p><p className="text-xs text-yard-500">Years experience</p></div>
          <div><p className="font-mono text-lg font-semibold text-yard-950">{worker.jobsCompleted}</p><p className="text-xs text-yard-500">Jobs completed</p></div>
          <div><p className="font-mono text-lg font-semibold text-yard-950">{worker.contactCount}</p><p className="text-xs text-yard-500">Times contacted</p></div>
        </div>

        {worker.bio && <p className="mt-5 text-sm leading-relaxed text-yard-700">{worker.bio}</p>}

        {worker.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {worker.skills.map((s) => (
              <span key={s} className="rounded-full bg-yard-100 px-3 py-1 text-xs text-yard-700">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold text-yard-950">Client reviews</h2>

        {user?.role === "client" && (
          <form onSubmit={submitReview} className="card mb-6 p-5">
            <label className="label">Your rating</label>
            <StarRating value={rating} interactive onChange={setRating} size="text-xl" />
            <label className="label mt-4">Comment</label>
            <textarea
              className="input min-h-[90px]"
              placeholder="How was the work?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {msg && <p className="mt-2 text-sm text-yard-600">{msg}</p>}
            <button className="btn-primary mt-3 text-sm" disabled={submitting}>
              {submitting ? "Posting..." : "Post review"}
            </button>
          </form>
        )}
        {!user && (
          <p className="mb-6 text-sm text-yard-500">
            <Link to="/login" className="font-medium text-amber-600 hover:underline">Log in</Link> as a client to leave a review.
          </p>
        )}

        {reviews.length === 0 && <p className="text-sm text-yard-500">No reviews yet — be the first to hire and review.</p>}

        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-yard-900">{r.client?.name || "Client"}</span>
                <StarRating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-yard-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

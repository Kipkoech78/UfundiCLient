import { SUPPORT, telHref, waHref } from "../api/api.js";

export default function Support() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-2">We're here to help</p>
      <h1 className="mb-4 font-display text-3xl font-semibold text-yard-950">Customer Support</h1>
      <p className="mb-10 text-yard-600">
        Trouble finding a fundi, a dispute with a job, or feedback on the app — reach our support team directly.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href={telHref(SUPPORT.phone)} className="card flex flex-col gap-1 p-6 transition hover:border-amber-500">
          <span className="eyebrow">Call us</span>
          <span className="font-display text-xl font-semibold text-yard-950">{SUPPORT.phone}</span>
          <span className="text-sm text-yard-500">Available during business hours</span>
        </a>

        <a href={waHref(SUPPORT.phone, "Hi UfundiHome support, I need help with...")} target="_blank" rel="noreferrer"
          className="card flex flex-col gap-1 p-6 transition hover:border-amber-500">
          <span className="eyebrow">WhatsApp us</span>
          <span className="font-display text-xl font-semibold text-yard-950">{SUPPORT.phone}</span>
          <span className="text-sm text-yard-500">Fastest way to reach us</span>
        </a>

        <a href={`mailto:${SUPPORT.email}`} className="card flex flex-col gap-1 p-6 transition hover:border-amber-500 sm:col-span-2">
          <span className="eyebrow">Email us</span>
          <span className="font-display text-xl font-semibold text-yard-950">{SUPPORT.email}</span>
          <span className="text-sm text-yard-500">For detailed queries or partnership requests</span>
        </a>
      </div>
    </div>
  );
}

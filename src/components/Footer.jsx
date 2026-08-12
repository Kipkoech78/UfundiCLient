import { Link } from "react-router-dom";
import { SUPPORT, telHref, waHref } from "../api/api.js";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-yard-800 bg-yard-950 text-yard-200">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 font-display text-xs font-bold text-yard-950">UH</span>
              <span className="font-display text-base font-semibold text-white">UfundiHome</span>
            </div>
            <p className="text-sm leading-relaxed text-yard-400">
              Verified fundis near you, across Kenya. Plumbers, electricians, painters, fitters, welders and general
              contractors — one tap to call or WhatsApp.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-yard-300">
              <li><Link to="/workers" className="hover:text-white">Find a fundi</Link></li>
              <li><Link to="/register" className="hover:text-white">Register as a fundi</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Worker dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Trades covered</p>
            <ul className="space-y-2 text-sm text-yard-300">
              <li>Plumbers &amp; Fitters</li>
              <li>Electricians &amp; Metalworkers</li>
              <li>Painters &amp; Fixers</li>
              <li>General Contractors &amp; Casual Labour</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Customer Support</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={telHref(SUPPORT.phone)} className="flex items-center gap-2 text-yard-300 hover:text-white">
                  <span className="font-mono text-amber-400">Call</span> {SUPPORT.phone}
                </a>
              </li>
              <li>
                <a href={waHref(SUPPORT.phone, "Hi UfundiHome support, I need help with...")} className="flex items-center gap-2 text-yard-300 hover:text-white">
                  <span className="font-mono text-amber-400">WhatsApp</span> {SUPPORT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT.email}`} className="flex items-center gap-2 text-yard-300 hover:text-white">
                  <span className="font-mono text-amber-400">Email</span> {SUPPORT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-yard-800 pt-6 text-xs text-yard-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} UfundiHome. Nairobi, Kenya.</span>
          <span>Built for Kenyan tradespeople — done once, done right.</span>
        </div>
      </div>
    </footer>
  );
}

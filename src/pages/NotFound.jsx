import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm text-amber-600">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-yard-950">Page not found</h1>
      <p className="mt-2 text-yard-600">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
    </div>
  );
}

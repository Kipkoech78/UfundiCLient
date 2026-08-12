import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? "text-yard-950" : "text-yard-600 hover:text-yard-950"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-yard-200 bg-yard-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-yard-950 font-display text-sm font-bold text-amber-400">
            UH
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">UfundiHome</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/workers" className={linkClass}>Find a Fundi</NavLink>
          <NavLink to="/support" className={linkClass}>Support</NavLink>
          {user?.role === "worker" && <NavLink to="/dashboard" className={linkClass}>My Dashboard</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-yard-600 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="btn-outline !px-3.5 !py-2 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-yard-700 hover:text-yard-950">Log in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">Join as a Fundi</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

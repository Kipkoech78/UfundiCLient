import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../utils/roleHome.js";

// Wraps every public page. Admins are never allowed to see it - they're bounced to /admin.
export default function PublicLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-yard-500">Loading...</div>;
  if (user?.role === "admin") return <Navigate to={homeFor(user)} replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

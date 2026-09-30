import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api.js";

const makeId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

const stored = (store, key) => {
  try {
    let v = store.getItem(key);
    if (!v) { v = makeId(); store.setItem(key, v); }
    return v;
  } catch { return makeId(); }
};

const ids = () => ({ visitorId: stored(localStorage, "uh_vid"), sessionId: stored(sessionStorage, "uh_sid") });
const skip = (p) => p.startsWith("/admin");

// Page-view tracking on every route change + a 30s heartbeat that powers "online now" in the admin dashboard.
export default function useTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (skip(pathname)) return;
    let referrer = "";
    try {
      if (!sessionStorage.getItem("uh_seen")) {
        sessionStorage.setItem("uh_seen", "1");
        if (document.referrer && !document.referrer.includes(location.host)) referrer = document.referrer;
      }
    } catch { /* ignore */ }
    api.post("/analytics/track", { ...ids(), path: pathname, referrer }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible" && !skip(location.pathname)) {
        api.post("/analytics/track", { ...ids(), type: "ping" }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(t);
  }, []);
}

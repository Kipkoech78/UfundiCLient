// Where each role lands after logging in (or when they hit a page they can't access).
export const homeFor = (user) => (user?.role === "admin" ? "/admin" : "/");

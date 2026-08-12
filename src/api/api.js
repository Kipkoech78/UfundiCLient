import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ufundihome_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const SUPPORT = {
  phone: import.meta.env.VITE_SUPPORT_PHONE || "0719200522",
  email: import.meta.env.VITE_SUPPORT_EMAIL || "ufundihome@gmail.com",
};

export function telHref(phone) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function waHref(phone, message = "") {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "254");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

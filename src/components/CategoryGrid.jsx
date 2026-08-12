import { useNavigate } from "react-router-dom";

const CATEGORY_MARKS = [
  { name: "Plumber", mark: "01" },
  { name: "Electrician", mark: "02" },
  { name: "Fitter", mark: "03" },
  { name: "Fixer / Handyman", mark: "04" },
  { name: "Painter", mark: "05" },
  { name: "General Contractor", mark: "06" },
  { name: "Metalworker / Welder", mark: "07" },
  { name: "Carpenter", mark: "08" },
  { name: "Mason", mark: "09" },
  { name: "Roofer", mark: "10" },
  { name: "Mover / Casual Labour", mark: "11" },
  { name: "Other", mark: "12" },
];

export default function CategoryGrid() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {CATEGORY_MARKS.map((c) => (
        <button
          key={c.name}
          onClick={() => navigate(`/workers?category=${encodeURIComponent(c.name)}`)}
          className="group flex items-center justify-between rounded-lg border border-yard-200 bg-white px-4 py-3.5 text-left transition hover:border-amber-500 hover:shadow-card"
        >
          <span className="font-display text-sm font-semibold text-yard-900">{c.name}</span>
          <span className="font-mono text-xs text-yard-400 group-hover:text-amber-600">{c.mark}</span>
        </button>
      ))}
    </div>
  );
}

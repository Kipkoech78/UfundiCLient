export default function StarRating({ value = 0, count, size = "text-sm", interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="flex">
        {stars.map((s) => (
          <span
            key={s}
            onClick={() => interactive && onChange?.(s)}
            className={`${interactive ? "cursor-pointer" : ""} ${s <= Math.round(value) ? "text-amber-500" : "text-yard-200"}`}
          >
            ★
          </span>
        ))}
      </span>
      {value > 0 && <span className="font-mono text-yard-600">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-yard-400">({count})</span>}
    </span>
  );
}

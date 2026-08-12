export default function RadarDot({ size = "md", color = "amber" }) {
  const dims = { sm: "h-2.5 w-2.5", md: "h-3.5 w-3.5", lg: "h-5 w-5" }[size];
  const dot = color === "green" ? "bg-signal-green" : "bg-amber-500";
  const ring = color === "green" ? "bg-signal-green/50" : "bg-amber-500/50";

  return (
    <span className="relative inline-flex items-center justify-center">
      <span className={`absolute inline-flex rounded-full ${ring} ${dims} animate-radar`} />
      <span className={`relative inline-flex rounded-full ${dot} ${dims} ring-2 ring-white`} />
    </span>
  );
}

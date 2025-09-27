import type { ConfidenceLevel } from "@/lib/types/reading";

const confidenceCopy: Record<ConfidenceLevel, { label: string; tone: string }> = {
  high: { label: "High confidence", tone: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium confidence", tone: "bg-amber-100 text-amber-700" },
  low: { label: "Lower confidence", tone: "bg-rose-100 text-rose-700" },
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const config = confidenceCopy[level];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.tone}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {config.label}
    </span>
  );
}

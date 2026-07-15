import type { SourceRef } from "@/lib/retrieval";

export default function SourceBadges({ sources }: { sources: SourceRef[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <span
          key={s.id}
          title={s.sourceUrl ? s.sourceUrl : s.sourceLabel}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
            s.tier === "company"
              ? "border-emerald-700/30 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-amber-700/30 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          <span className="opacity-70">{s.tier === "company" ? "🏢" : "⚖️"}</span>
          {s.title}
        </span>
      ))}
    </div>
  );
}

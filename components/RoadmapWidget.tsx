const TODAY = ["Intake", "Knowledge"];
const COMING = ["Workflow", "Quote generation", "Dispatch integration", "CRM sync"];

export default function RoadmapWidget() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-2.5 text-xs dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold uppercase tracking-wide text-black/50 dark:text-white/40">
          Today
        </span>
        {TODAY.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 text-black/80 dark:text-white/80">
            ✅ {item}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold uppercase tracking-wide text-black/50 dark:text-white/40">
          Coming
        </span>
        {COMING.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 text-black/50 dark:text-white/50">
            ☐ {item}
          </span>
        ))}
      </div>
    </div>
  );
}

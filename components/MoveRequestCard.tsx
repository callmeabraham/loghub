function parseFields(raw: string): { label: string; value: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

export default function MoveRequestCard({ raw }: { raw: string }) {
  const fields = parseFields(raw);

  return (
    <div className="mt-3 rounded-xl border border-blue-700/25 bg-blue-50/70 p-4 dark:border-blue-400/25 dark:bg-blue-950/30">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
        <span>📋</span>
        Draft Move Request
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {fields.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-blue-900/70 dark:text-blue-300/70">{f.label}</dt>
            <dd className="text-blue-950 dark:text-blue-100">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import type { TimelineEntry } from "./timeline-data";

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={entry.title} className="flex gap-4">
          <div className="flex flex-none flex-col items-center">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-strong text-xs font-bold text-white"
            >
              {index + 1}
            </span>
            {index < entries.length - 1 ? (
              <span aria-hidden="true" className="w-px flex-1 bg-n-200" />
            ) : null}
          </div>
          <div className="pb-8">
            <h3 className="font-display text-lg font-bold text-ink">
              {entry.title}
            </h3>
            <p className="mt-1 text-sm text-n-700">{entry.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

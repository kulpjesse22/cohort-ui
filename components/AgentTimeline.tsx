import { AGENTS } from "@/lib/agents";
import type { TimelineEntry, TimelineSummary, Verdict } from "@/lib/timeline";

/** Callback ref: centers a newly-highlighted entry without an effect. */
function scrollIntoView(el: HTMLDivElement | null) {
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const VERDICT_STYLE: Record<Verdict, string> = {
  Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Approved with fixes": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Revise: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export const KIND_LABEL: Record<TimelineEntry["kind"], string> = {
  task: "Shipped",
  review: "Review",
  promotion: "Promotion",
  lesson: "Lesson",
  decision: "Decision",
  brief: "Brief",
};

export const KIND_DOT: Record<TimelineEntry["kind"], string> = {
  task: "bg-sky-400/70",
  review: "bg-zinc-500",
  promotion: "bg-emerald-400",
  lesson: "bg-violet-400/70",
  decision: "bg-zinc-200",
  brief: "bg-zinc-400",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
      <div className="text-lg font-semibold text-zinc-100">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}

function PromotionEntry({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-emerald-300">{entry.title}</span>
        <span className="font-mono text-[11px] text-emerald-400/70">
          {entry.from} → {entry.to}
        </span>
        <span className="ml-auto text-[11px] text-zinc-500">{formatDate(entry.date)}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{entry.detail}</p>
    </div>
  );
}

function StandardEntry({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="relative pl-6">
      <span
        className={`absolute left-[3px] top-[7px] h-2 w-2 rounded-full ${KIND_DOT[entry.kind]}`}
      />
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
          {KIND_LABEL[entry.kind]}
        </span>
        <span className="text-sm font-medium text-zinc-100">{entry.title}</span>
        {entry.verdict && (
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${VERDICT_STYLE[entry.verdict]}`}
          >
            {entry.verdict}
          </span>
        )}
        {entry.reviewer && (
          <span className="text-[11px] text-zinc-500">by {AGENTS[entry.reviewer].name}</span>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-zinc-500">
          {formatDate(entry.date)}
        </span>
      </div>

      <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{entry.detail}</p>

      {entry.fixes && entry.fixes.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          {entry.fixes.map((fix) => (
            <li key={fix} className="flex gap-2 text-[12px] leading-relaxed text-zinc-400">
              <span className="shrink-0 text-zinc-600">—</span>
              <span>{fix}</span>
            </li>
          ))}
        </ul>
      )}

      {entry.artifact && (
        <div className="mt-1.5 font-mono text-[10px] text-zinc-600">{entry.artifact}</div>
      )}
    </div>
  );
}

export function AgentTimeline({
  entries,
  summary,
  highlightEntryId,
  dimStats,
  dimEntries,
}: {
  entries: TimelineEntry[];
  summary: TimelineSummary;
  /** Demo tour: ring this entry and scroll it into view. */
  highlightEntryId?: string;
  dimStats?: boolean;
  dimEntries?: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-2xl">
        <div
          className={`mb-6 grid grid-cols-2 gap-2 transition-opacity duration-500 sm:grid-cols-4 ${
            dimStats ? "opacity-25" : "opacity-100"
          }`}
        >
          <Stat value={String(summary.tasks)} label="Shipped" />
          {summary.reviewsTotal > 0 ? (
            <Stat
              value={`${summary.reviewsPassed}/${summary.reviewsTotal}`}
              label="Reviews passed"
            />
          ) : (
            <Stat value={String(summary.decisions)} label="Decisions" />
          )}
          <Stat value={String(summary.promotions)} label="Promotions" />
          <Stat value={String(summary.lessons)} label="Lessons logged" />
        </div>

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          History
        </h2>

        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
            No recorded history yet.
          </p>
        ) : (
          <div className="relative space-y-5">
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7px] top-2 w-px bg-zinc-800"
            />
            {entries.map((entry) => {
              const highlighted = highlightEntryId === entry.id;
              return (
                <div
                  key={entry.id}
                  ref={highlighted ? scrollIntoView : undefined}
                  className={`relative rounded-lg transition-all duration-500 ${
                    highlighted ? "ring-2 ring-zinc-100/40 ring-offset-4 ring-offset-zinc-900" : ""
                  } ${dimEntries && !highlighted ? "opacity-25" : "opacity-100"}`}
                >
                  {entry.kind === "promotion" ? (
                    <PromotionEntry entry={entry} />
                  ) : (
                    <StandardEntry entry={entry} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

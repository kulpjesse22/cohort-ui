import { AGENTS } from "@/lib/agents";
import type { TimelineEntry, TimelineSummary, Verdict } from "@/lib/timeline";

/** Callback ref: centers a newly-highlighted entry without an effect. */
function scrollIntoView(el: HTMLDivElement | null) {
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export const VERDICT_STYLE: Record<Verdict, string> = {
  Approved: "border-approved-line bg-approved-bg text-approved",
  "Approved with fixes": "border-fixes-line bg-fixes-bg text-fixes",
  Revise: "border-revise-line bg-revise-bg text-revise",
};

export const KIND_LABEL: Record<TimelineEntry["kind"], string> = {
  task: "Shipped",
  review: "Review",
  promotion: "Promotion",
  lesson: "Lesson",
  decision: "Decision",
  brief: "Brief",
};

// 500-level hues read on both a white and a near-black ground; the 300/400
// tints used elsewhere wash out in light mode.
export const KIND_DOT: Record<TimelineEntry["kind"], string> = {
  task: "bg-sky-500",
  review: "bg-ink-4",
  promotion: "bg-emerald-500",
  lesson: "bg-violet-500",
  decision: "bg-ink",
  brief: "bg-ink-3",
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
    <div className="rounded-lg border border-line bg-raised px-3 py-2.5">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[11px] text-ink-3">{label}</div>
    </div>
  );
}

function PromotionEntry({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="rounded-lg border border-approved-line bg-approved-bg px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-approved">{entry.title}</span>
        <span className="font-mono text-[11px] text-approved opacity-80">
          {entry.from} → {entry.to}
        </span>
        <span className="ml-auto text-[11px] text-ink-3">{formatDate(entry.date)}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{entry.detail}</p>
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
        <span className="text-[10px] uppercase tracking-wider text-ink-4">
          {KIND_LABEL[entry.kind]}
        </span>
        <span className="text-sm font-medium text-ink">{entry.title}</span>
        {entry.verdict && (
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${VERDICT_STYLE[entry.verdict]}`}
          >
            {entry.verdict}
          </span>
        )}
        {entry.reviewer && (
          <span className="text-[11px] text-ink-3">by {AGENTS[entry.reviewer].name}</span>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-ink-3">
          {formatDate(entry.date)}
        </span>
      </div>

      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{entry.detail}</p>

      {entry.fixes && entry.fixes.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-md border border-line bg-raised px-3 py-2">
          {entry.fixes.map((fix) => (
            <li key={fix} className="flex gap-2 text-[12px] leading-relaxed text-ink-2">
              <span className="shrink-0 text-ink-4">—</span>
              <span>{fix}</span>
            </li>
          ))}
        </ul>
      )}

      {entry.artifact && (
        <div className="mt-1.5 font-mono text-[10px] text-ink-4">{entry.artifact}</div>
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

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          History
        </h2>

        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-ink-3">
            No recorded history yet.
          </p>
        ) : (
          <div className="relative space-y-5">
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7px] top-2 w-px bg-raised"
            />
            {entries.map((entry) => {
              const highlighted = highlightEntryId === entry.id;
              return (
                <div
                  key={entry.id}
                  ref={highlighted ? scrollIntoView : undefined}
                  className={`relative rounded-lg transition-all duration-500 ${
                    highlighted ? "ring-2 ring-ink/30 ring-offset-4 ring-offset-canvas" : ""
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

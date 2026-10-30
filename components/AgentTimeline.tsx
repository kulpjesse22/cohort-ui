import type { ReactNode } from "react";
import { AGENTS } from "@/lib/agents";
import { ArtifactLink } from "./ArtifactLink";
import { KindMark, ProvenanceTag, VerdictMark } from "./Marks";
import type { TimelineEntry, TimelineSummary } from "@/lib/timeline";

/** Callback ref: centers a newly-highlighted entry without an effect. */
function scrollIntoView(el: HTMLDivElement | null) {
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export const KIND_LABEL: Record<TimelineEntry["kind"], string> = {
  task: "Shipped",
  review: "Review",
  promotion: "Promotion",
  lesson: "Lesson",
  decision: "Decision",
  brief: "Brief",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A figure over its label. Space and one hairline group them, not a tile each. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-3">
      <div className="font-display text-figure font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-1.5 text-meta text-ink-3">{label}</div>
    </div>
  );
}

/**
 * The one celebratory moment the design guide permits. Everything else on the
 * timeline is a row; this one is set in the display face, at the size of a
 * title, between two hairlines in its own hue. Type does the celebrating — no
 * fill, no animation, no gradient, no glow.
 */
function PromotionEntry({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="relative border-y border-approved-line py-5 pl-6">
      <span className="absolute -left-0.5 top-[1.15rem] bg-canvas py-1 text-approved" aria-hidden="true">
        <LaurelIcon />
      </span>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-label font-semibold uppercase tracking-[0.06em] text-approved">
          {KIND_LABEL.promotion}
        </span>
        <span className="ml-auto shrink-0 text-meta tabular-nums text-ink-3">
          {formatDate(entry.date)}
        </span>
      </div>

      <h3 className="mt-1 font-display text-title font-semibold text-approved">{entry.title}</h3>

      {entry.from && entry.to && (
        <p className="mt-2 flex items-center gap-2 text-meta">
          <span className="text-ink-3">{entry.from}</span>
          <span className="text-approved" aria-hidden="true">
            →
          </span>
          <span className="font-semibold text-approved">{entry.to}</span>
        </p>
      )}

      <p className="mt-2 text-body text-ink-2">{entry.detail}</p>
    </div>
  );
}

function LaurelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3.2c-1.9 1.5-2.8 3.6-2.8 5.8 0 2.2.9 4.3 2.8 5.8 1.9-1.5 2.8-3.6 2.8-5.8 0-2.2-.9-4.3-2.8-5.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M4.8 7.4c0 3.3 2.2 5.7 5.2 6.6M15.2 7.4c0 3.3-2.2 5.7-5.2 6.6M10 14v2.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StandardEntry({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="relative pl-6">
      <span className="absolute left-[2px] top-[3px] bg-canvas py-0.5">
        <KindMark kind={entry.kind} />
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
          {KIND_LABEL[entry.kind]}
        </span>
        <span className="ml-auto shrink-0 text-meta tabular-nums text-ink-3">
          {formatDate(entry.date)}
        </span>
      </div>

      <p className="mt-0.5 text-heading font-semibold text-ink">{entry.title}</p>

      {(entry.verdict || entry.reviewer) && (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {entry.verdict && <VerdictMark verdict={entry.verdict} />}
          {entry.reviewer && (
            <span className="text-meta text-ink-3">by {AGENTS[entry.reviewer].name}</span>
          )}
        </p>
      )}

      <p className="mt-1 text-body text-ink-2">{entry.detail}</p>

      {entry.fixes && entry.fixes.length > 0 && (
        <ol className="mt-2.5 space-y-1.5 border-l border-line-strong pl-3">
          {entry.fixes.map((fix, i) => (
            <li key={fix} className="flex gap-2 text-meta text-ink-2">
              <span className="w-3 shrink-0 tabular-nums text-ink-3">{i + 1}</span>
              <span>{fix}</span>
            </li>
          ))}
        </ol>
      )}

      {entry.artifact && (
        <div className="mt-1.5">
          <ArtifactLink path={entry.artifact} />
        </div>
      )}
    </div>
  );
}

export function AgentTimeline({
  entries,
  summary,
  masthead,
  highlightEntryId,
  dimStats,
  dimEntries,
}: {
  entries: TimelineEntry[];
  summary: TimelineSummary;
  /**
   * Rendered above the stats, inside the same column and the same scroll.
   * The profile puts its subject here; the tour and the workspace timeline
   * have a subject already and leave it out.
   */
  masthead?: ReactNode;
  /** Demo tour: ring this entry and scroll it into view. */
  highlightEntryId?: string;
  dimStats?: boolean;
  dimEntries?: boolean;
}) {
  return (
    <div
      className={`flex-1 overflow-y-auto px-4 lg:px-6 ${masthead ? "pb-16 pt-8 lg:pt-12" : "py-5"}`}
    >
      <div className="mx-auto max-w-2xl">
        {masthead}

        <div
          className={`mb-10 grid grid-cols-2 gap-x-6 border-y border-line transition-opacity duration-500 sm:grid-cols-4 ${
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

        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">History</h2>
          {masthead && (
            <ProvenanceTag kind="seeded" title="An illustration of the growth arc, not a log">
              Seeded to show the shape
            </ProvenanceTag>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="py-6 text-body text-ink-3">
            No recorded history yet. Shipped work, reviews and lessons will
            appear here.
          </p>
        ) : (
          <div className="relative space-y-7">
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7.5px] top-2 w-px bg-line"
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

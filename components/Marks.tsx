import type { TimelineEntry, Verdict } from "@/lib/timeline";

/**
 * State is carried by shape. Every mark here reads in grayscale; where a hue
 * is added (verdicts, the promotion) it repeats what the shape already says,
 * so a screenshot in black and white loses nothing. Hue in Cohort belongs to
 * agents: a kind of entry never borrows one.
 */

type Kind = TimelineEntry["kind"];

const KIND_PATH: Record<Kind, React.ReactNode> = {
  // Shipped: a solid block, the thing that exists now.
  task: <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />,
  // Review: an open ring, judgment rather than output.
  review: <circle cx="6" cy="6" r="3.6" stroke="currentColor" strokeWidth="1.4" fill="none" />,
  // Lesson: an open diamond.
  lesson: (
    <path d="M6 1.6 10.4 6 6 10.4 1.6 6Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
  ),
  // Decision: a filled diamond. A lesson that a human made binding.
  decision: <path d="M6 1.2 10.8 6 6 10.8 1.2 6Z" fill="currentColor" />,
  // Brief: a wedge pointing on, work handed to someone.
  brief: <path d="M3 2.2 9.6 6 3 9.8Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />,
  // Promotion: a filled chevron up.
  promotion: <path d="M1.8 8.6 6 3.2l4.2 5.4H7.6L6 6.5 4.4 8.6Z" fill="currentColor" />,
};

export function KindMark({ kind, className = "text-ink-3" }: { kind: Kind; className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={`shrink-0 ${className}`}>
      {KIND_PATH[kind]}
    </svg>
  );
}

const VERDICT_TONE: Record<Verdict, string> = {
  Approved: "text-approved",
  "Approved with fixes": "text-fixes",
  Revise: "text-revise",
};

function VerdictGlyph({ verdict }: { verdict: Verdict }) {
  if (verdict === "Approved") {
    return (
      <>
        <circle cx="7" cy="7" r="5.6" fill="currentColor" />
        <path d="m4.4 7.1 1.8 1.8 3.5-3.6" stroke="var(--canvas)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  if (verdict === "Approved with fixes") {
    return (
      <>
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <path d="M7 2a5 5 0 0 1 0 10Z" fill="currentColor" />
      </>
    );
  }
  // Revise: a ring that turns back on itself. The work goes back to its author.
  return (
    <>
      <path d="M11.6 7A4.6 4.6 0 1 1 9.3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M8.2 1.4 10.4 3 8.6 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** A verdict is a mark and its word, in the verdict's hue. Never a filled box. */
export function VerdictMark({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-flex items-center gap-1 text-meta font-semibold ${VERDICT_TONE[verdict]}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
        <VerdictGlyph verdict={verdict} />
      </svg>
      {verdict}
    </span>
  );
}

/**
 * Where a screen's content comes from. The product's whole claim is that the
 * record is the repo, so every surface says whether it is reading the repo or
 * showing a staged example — up front, not behind a click.
 *
 * live         filled dot     read off disk on this request
 * snapshot     half dot       committed to the repo, not re-read
 * seeded       open ring      written to show a shape
 * illustrative dashed ring    cycling sample, nothing behind it
 */
export type Provenance = "live" | "snapshot" | "seeded" | "illustrative";

function ProvenanceGlyph({ kind }: { kind: Provenance }) {
  switch (kind) {
    case "live":
      return <circle cx="5" cy="5" r="3.5" fill="currentColor" />;
    case "snapshot":
      return (
        <>
          <circle cx="5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M5 1.8a3.2 3.2 0 0 1 0 6.4Z" fill="currentColor" />
        </>
      );
    case "seeded":
      return <circle cx="5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none" />;
    case "illustrative":
      return (
        <circle cx="5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="1.6 1.4" />
      );
  }
}

export function ProvenanceMark({ kind }: { kind: Provenance }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="shrink-0">
      <ProvenanceGlyph kind={kind} />
    </svg>
  );
}

export function ProvenanceTag({
  kind,
  children,
  title,
}: {
  kind: Provenance;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-ink-3" title={title}>
      <ProvenanceMark kind={kind} />
      {children}
    </span>
  );
}

/** Rank as rungs. The word stays beside it: rungs alone are not self-explanatory. */
export function RankTicks({ rank, of = 4, className = "" }: { rank: number; of?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-end gap-[2px] ${className}`}>
      {Array.from({ length: of }, (_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-[1px] ${i < rank ? "bg-current" : "bg-current opacity-25"}`}
          style={{ height: `${5 + i * 2}px` }}
        />
      ))}
    </span>
  );
}

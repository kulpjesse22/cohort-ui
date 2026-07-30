import type { ActorId, AgentId } from "./agents";

export type EntryKind =
  | "task"
  | "review"
  | "promotion"
  | "lesson"
  /** Human-only: a durable product decision. */
  | "decision"
  /** Human-only: work handed to the team. */
  | "brief";

export type Verdict = "Approved" | "Approved with fixes" | "Revise";

export interface TimelineEntry {
  id: string;
  /** An agent or a human. The harness treats them as peers. */
  agentId: ActorId;
  kind: EntryKind;
  date: string;
  title: string;
  detail: string;
  /** review entries: who ran the review, and the outcome. */
  reviewer?: AgentId;
  verdict?: Verdict;
  /** review entries: the specific fixes that came back. */
  fixes?: string[];
  /** promotion entries. */
  from?: string;
  to?: string;
  /** the durable artifact this entry produced or was recorded in. */
  artifact?: string;
}

// Seeded history. Like lib/messages.ts, this is illustrative — the cloned
// harness repo has no real handoffs or lessons yet to read from. The arcs are
// grounded in each role's actual responsibilities in Agents/*.md.
const ENTRIES: TimelineEntry[] = [
  // ---------------------------------------------------------------- Julius
  {
    id: "ju-1",
    agentId: "julius",
    kind: "task",
    date: "2026-05-04",
    title: "Built the settings panel",
    detail:
      "First assigned UI task. Shipped the layout and the happy path; treated states as a follow-up rather than part of done.",
    artifact: "tasks/julius.md",
  },
  {
    id: "ju-2",
    agentId: "julius",
    kind: "review",
    date: "2026-05-06",
    title: "Design review — settings panel",
    detail:
      "Every required state was missing. The panel looked finished and behaved as if nothing could ever go wrong.",
    reviewer: "hephaestus",
    verdict: "Revise",
    fixes: [
      "Add empty, loading, and error states — all three were absent",
      "Disabled controls give no reason why they are disabled",
      "Destructive action has no confirmation and no undo",
    ],
    artifact: "handoffs/2026-05-06-hephaestus-settings-review.md",
  },
  {
    id: "ju-3",
    agentId: "julius",
    kind: "task",
    date: "2026-05-08",
    title: "Fixed all three blocking issues",
    detail:
      "Reworked the panel against the design contract instead of patching around the findings. Asked for the state model up front rather than guessing.",
    artifact: "handoffs/2026-05-06-hephaestus-settings-review.md",
  },
  {
    id: "ju-4",
    agentId: "julius",
    kind: "review",
    date: "2026-05-09",
    title: "Re-review — settings panel",
    detail:
      "All findings addressed. Noted that states were now designed, not bolted on afterward.",
    reviewer: "hephaestus",
    verdict: "Approved",
    artifact: "handoffs/2026-05-06-hephaestus-settings-review.md",
  },
  {
    id: "ju-5",
    agentId: "julius",
    kind: "lesson",
    date: "2026-05-09",
    title: "States are part of done, not a follow-up",
    detail:
      "A screen isn't complete when the happy path renders. Read the state model before building, not after review.",
    artifact: "lessons/ui-states-are-not-optional.md",
  },
  {
    id: "ju-6",
    agentId: "julius",
    kind: "promotion",
    date: "2026-05-10",
    from: "Junior",
    to: "Mid",
    title: "Promoted to Mid",
    detail:
      "Stopped needing states enumerated for him. Two consecutive artifacts shipped without a blocking state finding.",
  },
  {
    id: "ju-7",
    agentId: "julius",
    kind: "task",
    date: "2026-07-30",
    title: "Built the Cohort UI shell",
    detail:
      "Sidebar, channel thread, composer, context rail. Handled empty, loading, and error states in the first pass without being asked.",
    artifact: "tasks/julius.md",
  },
  {
    id: "ju-8",
    agentId: "julius",
    kind: "review",
    date: "2026-07-30",
    title: "Design review — Cohort UI shell",
    detail:
      "Structurally sound. No state findings this time; remaining notes were about overclaiming, not correctness.",
    reviewer: "athena",
    verdict: "Approved with fixes",
    fixes: [
      "Seniority badges risk reading as an evaluated rank — label them as placeholder",
    ],
    artifact: "handoffs/2026-07-30-athena-cohort-shell.md",
  },

  // -------------------------------------------------------------- Augustus
  {
    id: "au-1",
    agentId: "augustus",
    kind: "task",
    date: "2026-04-18",
    title: "Built the record import pipeline",
    detail: "Batch import with validation and a partial-success report.",
    artifact: "tasks/augustus.md",
  },
  {
    id: "au-2",
    agentId: "augustus",
    kind: "review",
    date: "2026-04-20",
    title: "Design review — import pipeline",
    detail:
      "Partial-success handling was thorough. Users could tell exactly which rows failed and why.",
    reviewer: "athena",
    verdict: "Approved",
    artifact: "handoffs/2026-04-20-athena-import.md",
  },
  {
    id: "au-3",
    agentId: "augustus",
    kind: "promotion",
    date: "2026-04-28",
    from: "Mid",
    to: "Senior",
    title: "Promoted to Senior",
    detail:
      "Consistently designs for the failure path without prompting. Now trusted to define data contracts other workers build against.",
  },
  {
    id: "au-4",
    agentId: "augustus",
    kind: "task",
    date: "2026-07-30",
    title: "Built the Cohort data layer",
    detail:
      "Agent roster config, live harness markdown reader, seeded message store, and the GET/POST API routes.",
    artifact: "tasks/augustus.md",
  },
  {
    id: "au-5",
    agentId: "augustus",
    kind: "lesson",
    date: "2026-07-30",
    title: "Next.js 16 route params are async",
    detail:
      "Dynamic route handlers receive params as a Promise. Caught during implementation, logged so the next worker doesn't rediscover it.",
    artifact: "lessons/nextjs-16-async-params.md",
  },
  {
    id: "au-6",
    agentId: "augustus",
    kind: "review",
    date: "2026-07-30",
    title: "Design review — Cohort data layer",
    detail:
      "Context rail correctly distinguishes 'file missing' from 'file is an unfilled template' — a real empty state, not a generic one.",
    reviewer: "athena",
    verdict: "Approved",
    artifact: "handoffs/2026-07-30-athena-cohort-data.md",
  },

  // ---------------------------------------------------------------- Athena
  {
    id: "at-1",
    agentId: "athena",
    kind: "review",
    date: "2026-04-20",
    title: "Reviewed the import pipeline",
    detail:
      "Confirmed partial-success and many-record handling held up at scale. Approved without fixes.",
    verdict: "Approved",
    artifact: "handoffs/2026-04-20-athena-import.md",
  },
  {
    id: "at-2",
    agentId: "athena",
    kind: "lesson",
    date: "2026-06-02",
    title: "Density is not the same as clutter",
    detail:
      "Recorded after three reviews where simplification would have removed the operational context users needed to act.",
    artifact: "lessons/density-vs-clutter.md",
  },
  {
    id: "at-3",
    agentId: "athena",
    kind: "review",
    date: "2026-07-30",
    title: "Reviewed the Cohort data layer",
    detail: "Checked the empty and not-found states in the context rail.",
    verdict: "Approved",
    artifact: "handoffs/2026-07-30-athena-cohort-data.md",
  },
  {
    id: "at-4",
    agentId: "athena",
    kind: "review",
    date: "2026-07-30",
    title: "Reviewed the Cohort UI shell",
    detail:
      "Flagged that seniority badges could be read as an evaluated rank when they are currently static placeholders.",
    verdict: "Approved with fixes",
    fixes: ["Label seniority as a placeholder until it is derived from evidence"],
    artifact: "handoffs/2026-07-30-athena-cohort-shell.md",
  },

  // ----------------------------------------------------------- Hephaestus
  {
    id: "he-1",
    agentId: "hephaestus",
    kind: "review",
    date: "2026-05-06",
    title: "Reviewed the settings panel",
    detail:
      "Returned Revise. Three blocking state issues; assigned the fixes back to Julius rather than redesigning around them.",
    verdict: "Revise",
    artifact: "handoffs/2026-05-06-hephaestus-settings-review.md",
  },
  {
    id: "he-2",
    agentId: "hephaestus",
    kind: "task",
    date: "2026-07-30",
    title: "Set the design direction for Cohort",
    detail:
      "One visual climax per screen (the active thread). Registry seniority as a quiet badge. Context rail reads as reference, not the main event.",
    artifact: "designs/cohort-shell/design.md",
  },
  {
    id: "he-3",
    agentId: "hephaestus",
    kind: "lesson",
    date: "2026-07-30",
    title: "A durable log reads differently than a live chat",
    detail:
      "Recorded in the UX guide: this product is something you review, not something you keep up with. Shapes scroll, density, and notification behavior.",
    artifact: "UX.md",
  },

  // ----------------------------------------------------------------- Jesse
  // Human entries. These are real decisions from building this project, which
  // is the point: the record does not distinguish who is made of what.
  {
    id: "je-1",
    agentId: "jesse",
    kind: "brief",
    date: "2026-07-30",
    title: "Briefed the Cohort build",
    detail:
      "Asked for a workspace UI over the real harness rather than a mockup — reading actual repo files where it adds value.",
  },
  {
    id: "je-2",
    agentId: "jesse",
    kind: "decision",
    date: "2026-07-30",
    title: "UX.md becomes a harness convention",
    detail:
      "design.md covers visual style; nothing covered interaction conventions, research, or domain vocabulary. Added UX.md as its counterpart, owned by Hephaestus, with facts staying human-sourced.",
    artifact: "Agents/UX.md",
  },
  {
    id: "je-3",
    agentId: "jesse",
    kind: "decision",
    date: "2026-07-30",
    title: "Agents need a visible growth record",
    detail:
      "A seniority badge asserts standing without showing the work behind it. Called for a per-agent timeline that doubles as what someone would bring to a performance review.",
    artifact: "lib/timeline.ts",
  },
  {
    id: "je-4",
    agentId: "jesse",
    kind: "decision",
    date: "2026-07-30",
    title: "Cohort ships as its own repository",
    detail:
      "Still defining what this is and where it goes. Published standalone to gather feedback, with the harness installed into it so the demo reads a real one.",
    artifact: "Agents/planning.md",
  },
  {
    id: "je-5",
    agentId: "jesse",
    kind: "decision",
    date: "2026-07-30",
    title: "One timeline for the whole team",
    detail:
      "Per-agent history answered 'how did this agent grow' but not 'what happened on this project'. The project view treats human and agent work as one stream.",
    artifact: "components/TeamTimeline.tsx",
  },

  // -------------------------------------------------------------- Claudia
  {
    id: "cl-1",
    agentId: "claudia",
    kind: "task",
    date: "2026-04-18",
    title: "Sequenced the import pipeline work",
    detail:
      "Single worker. Schema and consumers were coupled, so the queue stayed sequential rather than split.",
    artifact: "planning.md",
  },
  {
    id: "cl-2",
    agentId: "claudia",
    kind: "task",
    date: "2026-07-30",
    title: "Applied the Parallel Split Gate to Cohort",
    detail:
      "Split rejected: Julius's components consume the shapes Augustus defines, so the queues fail the producer/consumer check. Sequenced instead of running both.",
    artifact: "planning.md",
  },
  {
    id: "cl-3",
    agentId: "claudia",
    kind: "task",
    date: "2026-07-30",
    title: "Recorded current product truth for Cohort",
    detail:
      "v1 shell over real harness roles with a mock conversation layer. Figma export, edit-sync, and agent wiring named explicitly as out of scope.",
    artifact: "planning.md",
  },
];

export interface TimelineSummary {
  tasks: number;
  reviewsPassed: number;
  reviewsTotal: number;
  promotions: number;
  lessons: number;
  decisions: number;
}

export function getTimeline(agentId: ActorId): TimelineEntry[] {
  return ENTRIES.filter((e) => e.agentId === agentId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

/** Every entry from every participant, newest first. */
export function getAllEntries(): TimelineEntry[] {
  return [...ENTRIES].sort((a, b) => b.date.localeCompare(a.date));
}

/** Entries grouped into descending date buckets, for the project view. */
export function getEntriesByDate(
  actorFilter?: ActorId | null
): { date: string; entries: TimelineEntry[] }[] {
  const source = actorFilter
    ? ENTRIES.filter((e) => e.agentId === actorFilter)
    : ENTRIES;

  const buckets = new Map<string, TimelineEntry[]>();
  for (const entry of source) {
    const existing = buckets.get(entry.date);
    if (existing) existing.push(entry);
    else buckets.set(entry.date, [entry]);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entries]) => ({ date, entries }));
}

/** Participant ids that appear anywhere in the record, in first-seen order. */
export function getActiveActorIds(): ActorId[] {
  return [...new Set(ENTRIES.map((e) => e.agentId))];
}

export function getTimelineSummary(agentId: ActorId): TimelineSummary {
  const entries = ENTRIES.filter((e) => e.agentId === agentId);
  const reviews = entries.filter((e) => e.kind === "review");
  return {
    tasks: entries.filter((e) => e.kind === "task" || e.kind === "brief").length,
    reviewsPassed: reviews.filter((e) => e.verdict !== "Revise").length,
    reviewsTotal: reviews.length,
    promotions: entries.filter((e) => e.kind === "promotion").length,
    lessons: entries.filter((e) => e.kind === "lesson").length,
    decisions: entries.filter((e) => e.kind === "decision").length,
  };
}

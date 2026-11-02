import { AGENT_ORDER, type ActorId } from "./agents";
import type { ResolvedHandoff } from "./reviews";

/**
 * Every agent conversation on one board. Most cards are the handoffs Reviews
 * already shows, placed by the same resolution (so a setting that closes a
 * stale handoff stops its card too). The rest are seeded conversations that
 * have not reached a person: queued work, work in progress, and two stops
 * where a rule bit.
 */

export const BOARD_STATES = ["queued", "working", "needs", "done", "stopped"] as const;
export type BoardState = (typeof BOARD_STATES)[number];

export const STATE_LABEL: Record<BoardState, string> = {
  queued: "Queued",
  working: "Working",
  needs: "Needs you",
  done: "Done",
  stopped: "Stopped",
};

export const PRIORITIES = ["high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", normal: "Normal", low: "Low" };

export const PROJECTS = [
  { id: "ui", name: "Workspace UI" },
  { id: "realtime", name: "Realtime" },
  { id: "design", name: "Design system" },
  { id: "planning", name: "Planning" },
] as const;
export type ProjectId = (typeof PROJECTS)[number]["id"];

export interface Conversation {
  id: string;
  task: string;
  agent: ActorId;
  /** External agents (Claude, Codex) are not participants; named directly. */
  agentName?: string;
  project: ProjectId;
  state: BoardState;
  /** Why it is where it is, when the state alone does not say. */
  note?: string;
  last: { actor: ActorId; actorName?: string; text: string };
  ageMinutes: number;
  priority: Priority;
  provenance: "seeded" | "live";
  /** Opens in Reviews when set; otherwise in the agent's channel. */
  reviewId?: string;
  channelId: string;
}

const HANDOFF_META: Record<string, { project: ProjectId; priority: Priority }> = {
  "keep-draft-on-failed-send": { project: "ui", priority: "high" },
  "status-outliving-agent": { project: "realtime", priority: "normal" },
  "revise-mark-at-12px": { project: "design", priority: "low" },
  "split-density-pass": { project: "planning", priority: "high" },
  "tour-caption-tokens": { project: "ui", priority: "low" },
  "memory-tier-empty-states": { project: "ui", priority: "normal" },
  "presence-tab-sleep": { project: "realtime", priority: "high" },
  "pin-design-guide-crit": { project: "ui", priority: "low" },
  "type-scale-guide": { project: "design", priority: "normal" },
  "channel-slugs": { project: "ui", priority: "low" },
  "note-2026-08-16-visual-density-pass": { project: "planning", priority: "normal" },
  "note-2026-08-18-codex-contribution-record": { project: "ui", priority: "normal" },
};

function stateOf(h: ResolvedHandoff): BoardState | null {
  if (h.group === "archived") return null;
  if (h.group === "needs" || h.group === "reviewing") return h.status.kind === "revising" ? "working" : "needs";
  if (h.group === "elsewhere") return "queued";
  if (h.status.kind === "stale") return "stopped";
  if (h.status.kind === "revising") return "working";
  return "done";
}

export function fromHandoffs(handoffs: ResolvedHandoff[], names: (id: ActorId) => string): Conversation[] {
  const out: Conversation[] = [];
  for (const h of handoffs) {
    const state = stateOf(h);
    if (!state) continue;
    const meta = HANDOFF_META[h.id] ?? { project: "ui" as ProjectId, priority: "normal" as Priority };
    const last = [...h.activity].sort((a, b) => a.minutesAgo - b.minutesAgo)[0];
    let note: string | undefined;
    if (h.group === "elsewhere") note = `Waiting on ${names(h.reviewerId)}`;
    else if (h.status.kind === "revising") note = "Back with its author after a Revise";
    else if (h.status.kind === "stale") note = "Stopped by your stale setting";
    out.push({
      id: `handoff-${h.id}`,
      task: h.title,
      agent: h.author,
      agentName: h.authorName,
      project: meta.project,
      state,
      note,
      last: last
        ? { actor: last.actor, actorName: last.actorName, text: last.text }
        : { actor: h.author, actorName: h.authorName, text: h.guide.summary },
      ageMinutes: h.closedMinutesAgo ?? h.ageMinutes,
      priority: meta.priority,
      provenance: h.provenance,
      reviewId: h.id,
      channelId: AGENT_ORDER.includes(h.author as never) ? h.author : "cohort",
    });
  }
  return out;
}

const H = 60;

export const SEEDED_CONVERSATIONS: Conversation[] = [
  {
    id: "density-thread",
    task: "Density pass: the thread and composer",
    agent: "julius",
    project: "planning",
    state: "queued",
    last: { actor: "claudia", text: "Queued behind the LessonLadder pass. Starts when that is reviewed." },
    ageMinutes: 3 * H + 20,
    priority: "normal",
    provenance: "seeded",
    channelId: "julius",
  },
  {
    id: "density-rail",
    task: "Density pass: the context rail",
    agent: "augustus",
    project: "planning",
    state: "queued",
    last: { actor: "claudia", text: "Queued third. Waits on the thread pass so globals.css has one editor at a time." },
    ageMinutes: 3 * H + 18,
    priority: "low",
    provenance: "seeded",
    channelId: "augustus",
  },
  {
    id: "grey-stale-status",
    task: "Grey a status before it drops",
    agent: "augustus",
    project: "realtime",
    state: "working",
    last: { actor: "augustus", text: "Running the type check before handing back to review." },
    ageMinutes: 24,
    priority: "normal",
    provenance: "seeded",
    channelId: "augustus",
  },
  {
    id: "welcome-copy-review",
    task: "Review the welcome screen copy",
    agent: "athena",
    project: "design",
    state: "working",
    last: { actor: "athena", text: "Reading Agents/UX.md before writing findings. Fixes go back to whoever wrote it." },
    ageMinutes: 47,
    priority: "normal",
    provenance: "seeded",
    channelId: "athena",
  },
  {
    id: "reviews-to-memory",
    task: "Plan how a repeated Revise becomes a lesson",
    agent: "claudia",
    project: "planning",
    state: "working",
    last: { actor: "claudia", text: "Checking scope. Two choices here are yours, so I will ask before assigning." },
    ageMinutes: 12,
    priority: "high",
    provenance: "seeded",
    channelId: "claudia",
  },
  {
    id: "rename-registry",
    task: "Rename the registry to roster",
    agent: "julius",
    project: "ui",
    state: "stopped",
    note: "Stopped by the glossary",
    last: { actor: "julius", text: "Stopped. The UX guide says Registry, not roster. Asking Hephaestus before changing a term." },
    ageMinutes: 5 * H,
    priority: "low",
    provenance: "seeded",
    channelId: "julius",
  },
  {
    id: "restyle-composer",
    task: "Restyle the composer toolbar",
    agent: "hephaestus",
    project: "design",
    state: "stopped",
    note: "Stopped by his role",
    last: { actor: "hephaestus", text: "Stopped. Composer.tsx is product code. I write the contract; a builder makes the change." },
    ageMinutes: 26 * H,
    priority: "normal",
    provenance: "seeded",
    channelId: "hephaestus",
  },
];

// --- Display ----------------------------------------------------------------

export const COLUMN_OPTIONS = [
  { value: "state", label: "State" },
  { value: "priority", label: "Priority" },
] as const;
export const ROW_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "project", label: "Project" },
  { value: "none", label: "No grouping" },
] as const;
export const ORDER_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "age", label: "Age" },
] as const;
export const PROPERTY_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "age", label: "Age" },
  { value: "priority", label: "Priority" },
  { value: "provenance", label: "Provenance" },
  { value: "last", label: "Last message" },
] as const;

export type ColumnsBy = (typeof COLUMN_OPTIONS)[number]["value"];
export type RowsBy = (typeof ROW_OPTIONS)[number]["value"];
export type OrderBy = (typeof ORDER_OPTIONS)[number]["value"];
export type Property = (typeof PROPERTY_OPTIONS)[number]["value"];

export interface BoardDisplay {
  layout: "board" | "list";
  columns: ColumnsBy;
  rows: RowsBy;
  order: OrderBy;
  showCompleted: boolean;
  showEmptyColumns: boolean;
  showEmptyRows: boolean;
  properties: Property[];
}

export const FACTORY_DISPLAY: BoardDisplay = {
  layout: "board",
  columns: "state",
  rows: "agent",
  order: "priority",
  showCompleted: true,
  showEmptyColumns: true,
  showEmptyRows: false,
  properties: ["agent", "age", "priority", "provenance", "last"],
};

function oneOf<T extends string>(options: readonly { value: T }[], v: unknown, fallback: T): T {
  return options.some((o) => o.value === v) ? (v as T) : fallback;
}

export function parseDisplay(raw: unknown): BoardDisplay {
  const v = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof BoardDisplay, unknown>>;
  const f = FACTORY_DISPLAY;
  return {
    layout: v.layout === "list" || v.layout === "board" ? v.layout : f.layout,
    columns: oneOf(COLUMN_OPTIONS, v.columns, f.columns),
    rows: oneOf(ROW_OPTIONS, v.rows, f.rows),
    order: oneOf(ORDER_OPTIONS, v.order, f.order),
    showCompleted: typeof v.showCompleted === "boolean" ? v.showCompleted : f.showCompleted,
    showEmptyColumns: typeof v.showEmptyColumns === "boolean" ? v.showEmptyColumns : f.showEmptyColumns,
    showEmptyRows: typeof v.showEmptyRows === "boolean" ? v.showEmptyRows : f.showEmptyRows,
    properties: Array.isArray(v.properties)
      ? PROPERTY_OPTIONS.map((o) => o.value).filter((p) => (v.properties as unknown[]).includes(p))
      : f.properties,
  };
}

export function sameDisplay(a: BoardDisplay, b: BoardDisplay): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function sortConversations(items: Conversation[], order: OrderBy): Conversation[] {
  return [...items].sort((a, b) =>
    order === "priority"
      ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.ageMinutes - b.ageMinutes
      : a.ageMinutes - b.ageMinutes
  );
}

export const isCompleted = (c: Conversation) => c.state === "done" || c.state === "stopped";

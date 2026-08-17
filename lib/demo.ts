import type { AgentId } from "./agents";

/** Which region the caption is talking about. Everything else dims. */
export type Spotlight = "sidebar" | "main" | "rail" | "stats" | "handoff" | null;

export interface DemoStep {
  title: string;
  body: string;
  /**
   * The surface this beat is about. Views that are not channel-shaped still
   * carry an id so the context rail has an owner to pin; the planner owns the
   * record, so they pin hers.
   */
  view:
    | { kind: "splash"; id: "claudia" }
    | { kind: "channel"; id: string }
    | { kind: "timeline"; id: "claudia" }
    | { kind: "profile"; id: AgentId }
    | { kind: "memory"; id: "claudia" };
  spotlight: Spotlight;
  /** Timeline entry to scroll to and ring, on profile views. */
  focusEntryId?: string;
  /** How long this beat holds when auto-playing, in ms. */
  holdMs: number;
}

/**
 * Six beats, one claim: this is a workspace for directing and developing a
 * team, not for launching jobs.
 *
 * The arc opens and closes on the handoff chip deliberately. It is the
 * primitive everything else is an expression of — the profile is a handoff
 * history, team memory is what handoffs deposited, the timeline is handoffs in
 * order. Naming it at the start and returning to it at the end is what stops
 * the middle beats reading as a feature tour.
 *
 * Beat four is the differentiator and it is also the thinnest. Frame it as
 * direction rather than overclaiming what is derived today.
 */
export const DEMO_STEPS: DemoStep[] = [
  {
    title: "A team developing, not jobs running",
    body: "Most agent tools show you jobs executing. That chip is something else: work moving between accountable roles — who holds it now, and who handed it over.",
    view: { kind: "splash", id: "claudia" },
    spotlight: null,
    holdMs: 11000,
  },
  {
    title: "The lead is not a chatbot persona",
    body: "Claudia owns routing, and owns making context durable. She hands a decision back rather than guessing at it, then writes what got settled into files the next session reads on its first turn.",
    view: { kind: "channel", id: "claudia" },
    spotlight: "main",
    holdMs: 13000,
  },
  {
    title: "A record of the team, not a run log",
    body: "Recurring workflows produce logs. Fleets of coding sessions produce logs. This is a history of named agents with roles — what they shipped, what came back in review, and what they learned.",
    view: { kind: "timeline", id: "claudia" },
    spotlight: "main",
    holdMs: 13000,
  },
  {
    title: "Every agent has a career surface",
    body: "Seniority, reviews with the specific fixes returned, lessons logged, promotions and the evidence behind them. Some of it is still illustration — but making an agent's development visible is what the whole product is built around.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    holdMs: 14000,
  },
  {
    title: "Memory that outlives the chat",
    body: "Nothing here depends on a session remembering. Decisions and lessons are written back to the repo, capped, and pushed toward automation until they stop being memory at all. This page is read off disk right now.",
    view: { kind: "memory", id: "claudia" },
    spotlight: "main",
    holdMs: 14000,
  },
  {
    title: "The handoff is the primitive",
    body: "Everything you just saw is an expression of one thing. Every piece of work should answer four questions: who owned it, who reviewed it, what changed, and what did the team learn?",
    view: { kind: "channel", id: "claudia" },
    spotlight: "handoff",
    holdMs: 14000,
  },
];

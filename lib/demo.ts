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
 * Seven beats, one claim: trust is the interface layer agent teams need before
 * they can safely earn more responsibility.
 *
 * This is deliberately not a feature tour. It walks the viewer through a trust
 * ladder: written scope, accountable handoff, separated review, lesson capture,
 * and visible growth. The product is the cohort becoming safer and more useful
 * over time, not a dashboard of jobs in flight.
 */
export const DEMO_STEPS: DemoStep[] = [
  {
    title: "Cohort helps teams grow agents they can trust",
    body: "Most agent tools focus on getting agents to do more work. Cohort asks a different question: how do agents join an existing team, learn its standards, and earn more responsibility over time?",
    // Opens inside the product, not on the splash: someone clicking "Guided
    // tour" from the sidebar has already arrived, and bouncing them back to the
    // landing page reads as a navigation mistake. Nothing is spotlit — this
    // beat states the thesis, so the whole workspace should be visible behind
    // it, and dimming to the chip here would also force its popover open.
    view: { kind: "channel", id: "cohort" },
    spotlight: null,
    holdMs: 11000,
  },
  {
    title: "Trust starts with written scope",
    body: "The harness assumes both humans and agents have unreliable memory. So chat is not the source of truth — the repo is. Project context, plans, tasks, handoffs, lessons, and decisions are the durable record the next actor reads.",
    view: { kind: "channel", id: "cohort" },
    spotlight: "rail",
    holdMs: 13000,
  },
  {
    title: "A handoff makes accountability explicit",
    body: "The chip is the primitive. It should always answer: from whom, to whom, why, based on what source, and what review happens next. That is the difference between activity and accountable work.",
    view: { kind: "channel", id: "cohort" },
    spotlight: "handoff",
    holdMs: 13000,
  },
  {
    title: "Safety means judgment is separated from execution",
    body: "Builders should not grade their own work. Reviews return specific fixes to the producing agent, and the finding becomes part of the record. That is how an agent gets corrected without everyone relying on memory.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    focusEntryId: "ju-2",
    holdMs: 14000,
  },
  {
    title: "Lessons become future behavior",
    body: "A correction only matters if the next pass inherits it. Team memory turns failures into standing guidance: what to do, what never to do again, and which gates should eventually block unsafe work automatically.",
    view: { kind: "memory", id: "claudia" },
    spotlight: "main",
    holdMs: 14000,
  },
  {
    title: "Responsibility is earned, not assigned once",
    body: "The agent profile is a career surface: reviews, lessons, promotion evidence, and the kinds of work the agent can now take on with less supervision. Growth is visible because trust has to be auditable.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    focusEntryId: "ju-6",
    holdMs: 14000,
  },
  {
    title: "The record is what lets the human stay in control",
    body: "The goal is not to remove the human. It is to give the human a trustworthy cohort: agents with roles, boundaries, review loops, and a shared memory they can use with their human counterparts.",
    view: { kind: "timeline", id: "claudia" },
    spotlight: "main",
    holdMs: 13000,
  },
];

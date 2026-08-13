import type { AgentId } from "./agents";

/** Which region the caption is talking about. Everything else dims. */
export type Spotlight = "sidebar" | "main" | "rail" | "stats" | null;

export interface DemoStep {
  title: string;
  body: string;
  /**
   * A channel thread, an agent's profile timeline, or the lesson ladder. The
   * memory view still carries an id so the context rail has something to pin;
   * lessons are Claudia-owned, so it pins hers.
   */
  view:
    | { kind: "channel"; id: string }
    | { kind: "profile"; id: AgentId }
    | { kind: "memory"; id: "claudia" };
  spotlight: Spotlight;
  /** Timeline entry to scroll to and ring, on profile views. */
  focusEntryId?: string;
  /** How long this beat holds when auto-playing, in ms. */
  holdMs: number;
}

/**
 * Four beats: the problem, the stop, the ladder, and what was staged.
 *
 * The tour used to walk the whole org — roles, scopes, review verdicts, an
 * agent's growth arc — which meant a viewer paid for a lot of context before
 * reaching an idea. This shows the two moments that nothing else does, and
 * leaves the org chart to be found by anyone who wants it.
 *
 * The opening names two absences and both are redeemed: "doesn't ask" by the
 * stop, "nothing changes when it's wrong" by the ladder. Don't add a third
 * without adding the beat that pays it off.
 *
 * It also bookends on spotlight: the first and last beats leave the whole
 * workspace lit, so the tour opens and closes on the room rather than a panel.
 */
export const DEMO_STEPS: DemoStep[] = [
  {
    title: "Most agents just start",
    body: "They don't ask what you meant. And when one gets something wrong, nothing about it changes. Giving an agent more to do is a judgment call — with nothing to base it on.",
    view: { kind: "channel", id: "claudia" },
    spotlight: null,
    holdMs: 10000,
  },
  {
    title: "She asks you, not the builder",
    body: "The request had two readings that build different products. The planner named the decision, said it wasn't hers to make, and handed it back. Nothing moved until you answered — ambiguity doesn't get passed down to whoever is holding the keyboard.",
    view: { kind: "channel", id: "claudia" },
    spotlight: "main",
    holdMs: 13000,
  },
  {
    title: "And a mistake becomes a rule",
    body: "Read off disk right now. A confirmed mistake becomes a lesson; a lesson that keeps firing becomes an always-on rule; a rule that can be automated becomes a check and stops being memory at all. Every tier is capped, so this gets smaller as the team learns.",
    view: { kind: "memory", id: "claudia" },
    spotlight: "main",
    holdMs: 14000,
  },
  {
    title: "What was staged, and what wasn't",
    body: "That conversation was written to show the shape — no live model is wired up here. This page is not: these are rules this project actually learned. The rest of the workspace is real too, and yours to poke at — five roles, their scopes, and what each has shipped.",
    view: { kind: "memory", id: "claudia" },
    spotlight: null,
    holdMs: 15000,
  },
];

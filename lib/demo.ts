import type { AgentId } from "./agents";

/** Which region the caption is talking about. Everything else dims. */
export type Spotlight = "sidebar" | "main" | "rail" | "stats" | null;

export interface DemoStep {
  title: string;
  body: string;
  /** A channel thread, or an agent's profile timeline. */
  view: { kind: "channel"; id: string } | { kind: "profile"; id: AgentId };
  spotlight: Spotlight;
  /** Timeline entry to scroll to and ring, on profile views. */
  focusEntryId?: string;
  /** How long this beat holds when auto-playing, in ms. */
  holdMs: number;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    title: "A team, not a tool",
    body: "Five agents, each with a defined role and a scope that doesn't move. Not one generalist you re-prompt until the session degrades — a planner, two builders, and two reviewers.",
    view: { kind: "channel", id: "claudia" },
    spotlight: "sidebar",
    holdMs: 9000,
  },
  {
    title: "You brief the planner like a colleague",
    body: "Work starts as a conversation in a scoped channel. Claudia turns the request into an assigned queue — explicit order, dependencies, and stop conditions — and refuses to assign ambiguous work.",
    view: { kind: "channel", id: "claudia" },
    spotlight: "main",
    holdMs: 11000,
  },
  {
    title: "The repo is the source of truth",
    body: "Decisions land in files, not chat logs. This panel is read live from the repository — the same files a brand-new session would read on its first turn. Nothing depends on anyone remembering.",
    view: { kind: "channel", id: "claudia" },
    spotlight: "rail",
    holdMs: 11000,
  },
  {
    title: "Scope is assigned, not improvised",
    body: "Each builder's work comes from their own task file. They don't infer what they own, and they stop rather than widen scope when an assumption breaks.",
    view: { kind: "channel", id: "augustus" },
    spotlight: "main",
    holdMs: 10000,
  },
  {
    title: "Execution and judgment are separate",
    body: "Models are confidently wrong. So the agent who builds is never the agent who approves — reviewers work against the design and UX guides and hand findings back.",
    view: { kind: "channel", id: "design-crit" },
    spotlight: "main",
    holdMs: 10000,
  },
  {
    title: "The reviewer catches what the builder missed",
    body: "Julius shipped a settings panel with no empty, loading, or error states. Hephaestus returned Revise with three specific fixes — assigned back to Julius, not quietly fixed around him.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    focusEntryId: "ju-2",
    holdMs: 12000,
  },
  {
    title: "The correction becomes memory",
    body: "He fixed all three, then wrote down why he'd missed them. The lesson outlives the session — it's a file the next agent reads, not something that evaporates when the chat ends.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    focusEntryId: "ju-5",
    holdMs: 11000,
  },
  {
    title: "And the agent grows",
    body: "Two builds later, states were handled in the first pass without being asked. That's the promotion — earned from evidence on the record, not assigned by vibes.",
    view: { kind: "profile", id: "julius" },
    spotlight: "main",
    focusEntryId: "ju-6",
    holdMs: 11000,
  },
  {
    title: "The track record writes itself",
    body: "Every task, verdict, correction, and lesson stays on the timeline. It's exactly what a person would bring to a performance review — except nobody had to assemble it.",
    view: { kind: "profile", id: "julius" },
    spotlight: "stats",
    holdMs: 11000,
  },
];

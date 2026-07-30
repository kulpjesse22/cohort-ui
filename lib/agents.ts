export type AgentId = "claudia" | "augustus" | "julius" | "athena" | "hephaestus";

export interface Agent {
  id: AgentId;
  name: string;
  title: string;
  /** Illustrative placeholder — not derived from lesson counts or history yet. */
  seniority: string;
  initials: string;
  color: string;
  blurb: string;
}

export const AGENTS: Record<AgentId, Agent> = {
  claudia: {
    id: "claudia",
    name: "Claudia",
    title: "Planner & Orchestrator",
    seniority: "Lead",
    initials: "CL",
    color: "violet",
    blurb: "Turns a request into a low-ambiguity plan, keeps planning.md current, coordinates workers.",
  },
  augustus: {
    id: "augustus",
    name: "Augustus",
    title: "Builder",
    seniority: "Senior",
    initials: "AU",
    color: "sky",
    blurb: "Worker. Scope comes from tasks/augustus.md, not a fixed technical area.",
  },
  julius: {
    id: "julius",
    name: "Julius",
    title: "Builder",
    seniority: "Mid",
    initials: "JU",
    color: "teal",
    blurb: "Worker. Scope comes from tasks/julius.md, not a fixed technical area.",
  },
  athena: {
    id: "athena",
    name: "Athena",
    title: "Design Reviewer",
    seniority: "Senior",
    initials: "AT",
    color: "amber",
    blurb: "Read-only enterprise product-design review. Assigns fixes back to the producing worker.",
  },
  hephaestus: {
    id: "hephaestus",
    name: "Hephaestus",
    title: "Design Director",
    seniority: "Senior",
    initials: "HE",
    color: "rose",
    blurb: "Human-interface designer. Owns the design contract; never touches product code.",
  },
};

export const AGENT_ORDER: AgentId[] = ["claudia", "augustus", "julius", "athena", "hephaestus"];

export interface Channel {
  id: string;
  name: string;
  kind: "agent" | "crit";
  memberIds: AgentId[];
  description: string;
}

export const CHANNELS: Channel[] = [
  ...AGENT_ORDER.map((id) => ({
    id,
    name: `#${id}`,
    kind: "agent" as const,
    memberIds: [id],
    description: AGENTS[id].blurb,
  })),
  {
    id: "design-crit",
    name: "#design-crit",
    kind: "crit" as const,
    memberIds: ["claudia", "athena", "hephaestus"],
    description: "Where Hephaestus's design contracts and Athena's reviews get discussed before a handoff ships.",
  },
];

export function getChannel(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}

export function getAgent(id: string): Agent | undefined {
  return AGENTS[id as AgentId];
}

// --- Participants -----------------------------------------------------------
// The harness treats humans and agents as peers on the same work, so the
// project timeline needs one identity type covering both. Humans have no
// seniority and no channel; everything else is shared.

export type HumanId = string;
export type ActorId = AgentId | HumanId;

export interface Human {
  id: HumanId;
  name: string;
  title: string;
  initials: string;
}

export const HUMANS: Record<HumanId, Human> = {
  jesse: {
    id: "jesse",
    name: "Jesse",
    title: "Product owner",
    initials: "JK",
  },
};

export interface Participant {
  id: ActorId;
  name: string;
  title: string;
  initials: string;
  kind: "agent" | "human";
  /** Agents only. Humans have no seniority in this model. */
  seniority?: string;
}

export function getParticipant(id: ActorId): Participant | undefined {
  const agent = AGENTS[id as AgentId];
  if (agent) {
    return { ...agent, kind: "agent" };
  }
  const human = HUMANS[id];
  if (human) {
    return { ...human, kind: "human" };
  }
  return undefined;
}

export function isAgent(id: ActorId): id is AgentId {
  return Boolean(AGENTS[id as AgentId]);
}

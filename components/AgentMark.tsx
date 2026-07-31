import type { AgentId } from "@/lib/agents";

/**
 * Per-agent identity marks. Each is a geometric read of what the role actually
 * does, drawn on the same 16px grid with the same 1.4 stroke so the set reads
 * as one family.
 *
 * These replace initials for agents. Safe to do because every surface that
 * shows an avatar also shows the name directly beside it — the mark never has
 * to carry identification on its own. Humans keep initials (see Avatar), which
 * doubles as the person/agent distinction.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Claudia() {
  // Planner: one source branching into assigned work.
  return (
    <>
      <circle cx="4" cy="8" r="1.6" {...STROKE} />
      <circle cx="12" cy="4.2" r="1.4" {...STROKE} />
      <circle cx="12" cy="11.8" r="1.4" {...STROKE} />
      <path d="M5.4 7.2 10.7 4.8M5.4 8.8 10.7 11.2" {...STROKE} />
    </>
  );
}

function Augustus() {
  // Builder: stacked courses, offset like bonded brick.
  return (
    <>
      <rect x="2.6" y="3" width="10.8" height="4" rx="1" {...STROKE} />
      <rect x="4.6" y="9" width="8.8" height="4" rx="1" {...STROKE} />
    </>
  );
}

function Julius() {
  // Builder, mirrored: same construction, opposite hand.
  return (
    <>
      <rect x="2.6" y="3" width="8.8" height="4" rx="1" {...STROKE} />
      <rect x="2.6" y="9" width="10.8" height="4" rx="1" {...STROKE} />
    </>
  );
}

function Athena() {
  // Reviewer: a considered eye — judgment, not decoration.
  return (
    <>
      <path d="M1.9 8s2.3-4 6.1-4 6.1 4 6.1 4-2.3 4-6.1 4-6.1-4-6.1-4Z" {...STROKE} />
      <circle cx="8" cy="8" r="1.7" {...STROKE} />
    </>
  );
}

function Hephaestus() {
  // Design director: compass — setting the direction others build to.
  return (
    <>
      <path d="M8 2.6 13 12.4H3L8 2.6Z" {...STROKE} />
      <circle cx="8" cy="9.4" r="1.5" {...STROKE} />
    </>
  );
}

const MARKS: Record<AgentId, () => React.JSX.Element> = {
  claudia: Claudia,
  augustus: Augustus,
  julius: Julius,
  athena: Athena,
  hephaestus: Hephaestus,
};

export function AgentMark({ agentId, size = 16 }: { agentId: AgentId; size?: number }) {
  const Mark = MARKS[agentId];
  if (!Mark) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <Mark />
    </svg>
  );
}

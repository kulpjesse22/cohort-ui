import { AGENTS, getParticipant, type ActorId, type AgentId } from "@/lib/agents";

// Hue, tint, and ring all come from one class so they move together between
// themes. Defined in app/globals.css. See Agents/design.md § Colors.
const RING: Record<string, string> = {
  violet: "agent-violet agent-chip",
  sky: "agent-sky agent-chip",
  teal: "agent-teal agent-chip",
  amber: "agent-amber agent-chip",
  rose: "agent-rose agent-chip",
};

// Humans read differently from agents on purpose: neutral fill, fully round,
// so a person is identifiable at a glance in a mixed stream.
const HUMAN = "bg-raised text-ink-2 ring-line-strong";

export function Avatar({
  agentId,
  size = "md",
}: {
  agentId: ActorId | "user";
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-xs";

  if (agentId === "user") {
    return (
      <div
        className={`flex ${dims} shrink-0 items-center justify-center rounded-full font-medium ring-1 ${HUMAN}`}
      >
        YOU
      </div>
    );
  }

  const agent = AGENTS[agentId as AgentId];
  if (agent) {
    return (
      <div
        className={`flex ${dims} shrink-0 items-center justify-center rounded-md font-medium ${RING[agent.color]}`}
        title={agent.name}
      >
        {agent.initials}
      </div>
    );
  }

  const participant = getParticipant(agentId);
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full font-medium ring-1 ${HUMAN}`}
      title={participant?.name ?? agentId}
    >
      {participant?.initials ?? "??"}
    </div>
  );
}

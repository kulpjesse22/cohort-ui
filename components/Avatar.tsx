import { AGENTS, getParticipant, type ActorId, type AgentId } from "@/lib/agents";
import { AgentMark } from "./AgentMark";

const HUE: Record<string, string> = {
  violet: "agent-violet agent-chip",
  sky: "agent-sky agent-chip",
  teal: "agent-teal agent-chip",
  amber: "agent-amber agent-chip",
  rose: "agent-rose agent-chip",
};

// Humans read differently from agents on purpose: initials in a neutral round
// chip against the agents' geometric marks in tinted squares. The shape carries
// the person/agent distinction before the colour does.
const HUMAN = "bg-raised text-ink-2 ring-1 ring-line-strong";

export function Avatar({
  agentId,
  size = "md",
}: {
  agentId: ActorId | "user";
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-6 w-6" : "h-9 w-9";
  const mark = size === "sm" ? 13 : 17;

  const agent = AGENTS[agentId as AgentId];
  if (agent) {
    return (
      <div
        className={`flex ${box} shrink-0 items-center justify-center rounded-[7px] ${HUE[agent.color]}`}
        title={agent.name}
      >
        <AgentMark agentId={agent.id} size={mark} />
      </div>
    );
  }

  const initials =
    agentId === "user" ? "YOU" : (getParticipant(agentId)?.initials ?? "??");
  const label = agentId === "user" ? "You" : getParticipant(agentId)?.name;

  return (
    <div
      className={`flex ${box} shrink-0 items-center justify-center rounded-full font-medium ${HUMAN} ${
        size === "sm" ? "text-[9px]" : "text-[10px]"
      }`}
      title={label ?? undefined}
    >
      {initials}
    </div>
  );
}

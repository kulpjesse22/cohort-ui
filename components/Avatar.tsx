import { AGENTS, getParticipant, type ActorId, type AgentId } from "@/lib/agents";

const RING: Record<string, string> = {
  violet: "bg-violet-500/20 text-violet-300 ring-violet-500/30",
  sky: "bg-sky-500/20 text-sky-300 ring-sky-500/30",
  teal: "bg-teal-500/20 text-teal-300 ring-teal-500/30",
  amber: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
  rose: "bg-rose-500/20 text-rose-300 ring-rose-500/30",
};

// Humans read differently from agents on purpose: neutral fill, fully round,
// so a person is identifiable at a glance in a mixed stream.
const HUMAN = "bg-zinc-700/60 text-zinc-200 ring-zinc-600/50";

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
        className={`flex ${dims} shrink-0 items-center justify-center rounded-md font-medium ring-1 ${RING[agent.color]}`}
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

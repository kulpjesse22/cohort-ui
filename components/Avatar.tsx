import { AGENTS, getParticipant, type ActorId, type AgentId } from "@/lib/agents";
import { Portrait } from "./Portrait";

/**
 * Slack-style rounded-square avatars. Agents get illustrated portraits so the
 * roster reads as a team rather than a set of icons; humans get initials on a
 * warm tint.
 *
 * Agents carry a small corner dot. It is the honest counterpart to the
 * portrait: these look like teammates, and the badge keeps it clear which ones
 * are agents — the same job Slack's "APP" tag does.
 */

const HUMAN_TINT = "bg-raised text-ink-2 ring-1 ring-inset ring-line-strong";

const RADIUS = { sm: "rounded-[6px]", md: "rounded-[8px]", lg: "rounded-[10px]" };
const BOX = { sm: "h-6 w-6", md: "h-9 w-9", lg: "h-11 w-11" };
const PX = { sm: 24, md: 36, lg: 44 };
const TEXT = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" };

export type AvatarSize = "sm" | "md" | "lg";

export function Avatar({
  agentId,
  size = "md",
  badge = true,
}: {
  agentId: ActorId | "user";
  size?: AvatarSize;
  /** Corner dot marking an agent. Off in dense pickers. */
  badge?: boolean;
}) {
  const agent = AGENTS[agentId as AgentId];

  if (agent) {
    return (
      <span className="relative inline-flex shrink-0">
        <span
          className={`overflow-hidden ${RADIUS[size]} ${BOX[size]} ring-1 ring-inset ring-black/[0.06]`}
          title={agent.name}
        >
          <Portrait agentId={agent.id} size={PX[size]} />
        </span>
        {badge && (
          <span
            aria-hidden="true"
            title="Agent"
            className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-canvas ${
              size === "sm" ? "p-[1.5px]" : "p-[2px]"
            }`}
          >
            <span
              className={`block rounded-full bg-ink-4 ${
                size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
              }`}
            />
          </span>
        )}
      </span>
    );
  }

  const initials =
    agentId === "user" ? "YOU" : (getParticipant(agentId)?.initials ?? "??");
  const label = agentId === "user" ? "You" : getParticipant(agentId)?.name;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-medium ${RADIUS[size]} ${BOX[size]} ${TEXT[size]} ${HUMAN_TINT}`}
      title={label ?? undefined}
    >
      {initials}
    </span>
  );
}

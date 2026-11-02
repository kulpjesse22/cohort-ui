import { getParticipant, type ActorId } from "@/lib/agents";
import { YOU } from "@/lib/reviews";
import { Avatar } from "./Avatar";

/** Roster members get their crew bust; Claude and Codex, who are not on the roster, get a plain tile. */
export function ActorAvatar({ id, name }: { id: ActorId; name?: string }) {
  if (getParticipant(id)) return <Avatar agentId={id === YOU ? "user" : id} size="sm" />;
  const label = name ?? id;
  return (
    <span className="relative inline-flex shrink-0" title={`${label}, an agent outside the registry`}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] bg-raised text-[9px] font-semibold text-ink-2 ring-1 ring-inset ring-line-strong">
        {label.slice(0, 2).toUpperCase()}
      </span>
      <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 rounded-full bg-canvas p-[1.5px]">
        <span className="block h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-ink-3" />
      </span>
    </span>
  );
}

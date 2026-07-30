import Link from "next/link";
import { AGENT_ORDER, AGENTS, CHANNELS } from "@/lib/agents";
import { Avatar } from "./Avatar";

const TEXT: Record<string, string> = {
  violet: "text-violet-300",
  sky: "text-sky-300",
  teal: "text-teal-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

export function Sidebar({
  activeChannelId,
  onSelect,
}: {
  /** null on profile pages, so no channel row falsely reads as active. */
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-sm shadow-2xl lg:shadow-none">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-4">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div>
          <div className="font-semibold text-zinc-100">Cohort</div>
          <div className="text-xs text-zinc-500">HAI-Harness workspace</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Link
          href="/"
          className="mb-4 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <span aria-hidden="true" className="text-zinc-600">
            ◈
          </span>
          <span className="truncate">Project timeline</span>
        </Link>

        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Channels
        </div>
        <nav className="mb-4 space-y-0.5">
          {CHANNELS.map((channel) => {
            const active = activeChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span className="text-zinc-600">#</span>
                <span className="truncate">{channel.id}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Registry
        </div>
        <ul className="space-y-1">
          {AGENT_ORDER.map((id) => {
            const agent = AGENTS[id];
            return (
              <li key={id}>
                <Link
                  href={`/agent/${id}`}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-zinc-900"
                >
                  <Avatar agentId={id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-medium ${TEXT[agent.color]}`}>
                      {agent.name}
                    </span>
                    <span className="block truncate text-[11px] text-zinc-500">
                      {agent.title}
                    </span>
                  </span>
                  <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {agent.seniority}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2 border-t border-zinc-800 px-4 py-3">
        <Link
          href="/demo"
          className="flex items-center gap-2 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <span aria-hidden="true">▶</span>
          Guided tour
        </Link>
        <p className="text-[11px] text-zinc-500">
          Seniority is a placeholder label, not yet derived from anything.
        </p>
      </div>
    </aside>
  );
}

import Link from "next/link";
import Image from "next/image";
import { AGENT_ORDER, AGENTS, CHANNELS } from "@/lib/agents";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({
  activeChannelId,
  onSelect,
}: {
  /** null on profile pages, so no channel row falsely reads as active. */
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
}) {
  return (
    <aside className="sidebar-scope flex h-full w-64 shrink-0 flex-col border-r border-sidebar-line bg-sidebar text-sm shadow-2xl lg:shadow-none">
      <div className="border-b border-sidebar-line px-4 py-3">
        <Image
          src="/cohort-wordmark-transparent.png"
          alt="Cohort"
          width={1550}
          height={440}
          priority
          className="h-auto w-24"
        />
        <div className="mt-0.5 text-[11px] text-sidebar-ink-3">
          Where people and agents work under the same rules.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Link
          href="/timeline"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sidebar-ink-2 transition-colors hover:bg-sidebar-hover hover:text-sidebar-ink"
        >
          <span aria-hidden="true" className="text-sidebar-ink-3">
            ◈
          </span>
          <span className="truncate">Project timeline</span>
        </Link>

        <Link
          href="/memory"
          className="mb-4 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sidebar-ink-2 transition-colors hover:bg-sidebar-hover hover:text-sidebar-ink"
        >
          <span aria-hidden="true" className="text-sidebar-ink-3">
            ◆
          </span>
          <span className="truncate">Team memory</span>
        </Link>

        <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-sidebar-ink-3">
          Channels
        </div>
        <nav className="mb-4 space-y-0.5">
          {CHANNELS.map((channel) => {
            const active = activeChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left transition-colors ${
                  active
                    ? "bg-sidebar-active text-sidebar-ink"
                    : "text-sidebar-ink-2 hover:bg-sidebar-hover hover:text-sidebar-ink"
                }`}
              >
                <span className="text-sidebar-ink-3">#</span>
                <span className="truncate">{channel.id}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-sidebar-ink-3">
          Registry
        </div>
        <ul className="space-y-1">
          {AGENT_ORDER.map((id) => {
            const agent = AGENTS[id];
            return (
              <li key={id}>
                <Link
                  href={`/agent/${id}`}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-hover"
                >
                  <Avatar agentId={id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-sidebar-ink">
                      {agent.name}
                    </span>
                    <span className="block truncate text-[11px] text-sidebar-ink-3">
                      {agent.title}
                    </span>
                  </span>
                  <span className="shrink-0 rounded border border-sidebar-line-strong px-1.5 py-0.5 text-[10px] text-sidebar-ink-2">
                    {agent.seniority}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2 border-t border-sidebar-line px-4 py-3">
        <Link
          href="/demo"
          className="flex items-center gap-2 rounded-md border border-sidebar-line-strong px-2.5 py-1.5 text-xs text-sidebar-ink-2 hover:bg-sidebar-hover"
        >
          <span aria-hidden="true">▶</span>
          Guided tour
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}

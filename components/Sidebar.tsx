"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AGENT_ORDER, AGENTS, CHANNELS } from "@/lib/agents";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { RankTicks } from "./Marks";
import { SettingsIcon } from "./Icons";

const PAGES = [
  { href: "/timeline", label: "Project timeline", glyph: "◈" },
  { href: "/memory", label: "Team memory", glyph: "◆" },
  { href: "/reviews", label: "Reviews", glyph: "◇" },
];

export function Sidebar({
  activeChannelId,
  onSelect,
}: {
  /** null on profile pages, so no channel row falsely reads as active. */
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
}) {
  const pathname = usePathname() ?? "";
  const on = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-line bg-sidebar text-sm shadow-2xl lg:shadow-none">
      <div className="border-b border-sidebar-line px-4 py-3">
        {/* The wordmark is the way back out. Only the mark itself is the target —
            the line under it is a descriptor, not a control. */}
        <Link
          href="/cohort"
          aria-label="Open Cohort"
          className="aff -m-1 inline-block rounded-md p-1"
        >
          <Image
            src="/cohort-wordmark-transparent.png"
            alt="Cohort"
            width={1550}
            height={440}
            priority
            className="h-auto w-24"
          />
        </Link>
        <div className="mt-1 text-meta text-sidebar-ink-3">
          Where people and agents work under the same rules.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <nav aria-label="Views" className="mb-4 space-y-0.5">
          {PAGES.map((page) => {
            const active = on(page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={`aff flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                  active ? "text-sidebar-ink" : "text-sidebar-ink-2 hover:text-sidebar-ink"
                }`}
              >
                <span aria-hidden="true" className="text-sidebar-ink-3">
                  {page.glyph}
                </span>
                <span className="truncate">{page.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-1.5 text-label font-semibold uppercase tracking-[0.06em] text-sidebar-ink-3">
          Channels
        </div>
        <nav className="mb-4 space-y-0.5">
          {CHANNELS.map((channel) => {
            const active = activeChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                aria-current={active ? "page" : undefined}
                className={`aff flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left ${
                  active ? "text-sidebar-ink" : "text-sidebar-ink-2 hover:text-sidebar-ink"
                }`}
              >
                <span className="text-sidebar-ink-3">#</span>
                <span className="truncate">{channel.id}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-1.5 text-label font-semibold uppercase tracking-[0.06em] text-sidebar-ink-3">
          Registry
        </div>
        <ul className="space-y-1">
          {AGENT_ORDER.map((id) => {
            const agent = AGENTS[id];
            return (
              <li key={id}>
                <Link
                  href={`/agent/${id}`}
                  className="aff flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left"
                >
                  <Avatar agentId={id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-meta font-semibold text-sidebar-ink">
                      {agent.name}
                    </span>
                    <span className="block truncate text-label text-sidebar-ink-3">
                      {agent.title}
                    </span>
                  </span>
                  <span
                    className="flex shrink-0 items-center gap-1.5 text-label text-sidebar-ink-3"
                    title={`${agent.seniority}: a label, not a permission`}
                  >
                    {agent.seniority}
                    <RankTicks rank={agent.rank} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-line px-2 py-3">
        <Link
          href="/demo"
          className="aff flex min-h-8 items-center gap-2 rounded-md px-2 text-meta text-sidebar-ink-2 hover:text-sidebar-ink"
        >
          <span aria-hidden="true" className="text-sidebar-ink-3">▶</span>
          Guided tour
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            aria-label="Settings"
            data-tip="Settings"
            aria-current={on("/settings") ? "page" : undefined}
            className={`aff tip flex h-8 w-8 items-center justify-center rounded-md ${
              on("/settings") ? "text-sidebar-ink" : "text-sidebar-ink-3 hover:text-sidebar-ink"
            }`}
          >
            <SettingsIcon />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

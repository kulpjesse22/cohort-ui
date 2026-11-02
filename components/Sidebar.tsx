"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { AGENT_ORDER, AGENTS, type AgentId } from "@/lib/agents";
import { parseFlags, useLocalState } from "@/lib/useLocalState";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { RankTicks } from "./Marks";
import {
  AgentsIcon,
  BoardIcon,
  BranchIcon,
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ComposeIcon,
  GearIcon,
  HashIcon,
  InboxIcon,
  MemoryIcon,
  PlayIcon,
  ReviewIcon,
  SearchIcon,
  TimelineIcon,
  UserPlusIcon,
} from "./Icons";

/**
 * The left nav. Personal first (what needs you, and your agents), then the
 * workspace's views, then each agent with its conversation and its reviews.
 * Every page in the app is reachable from here or from the workspace menu.
 *
 * No counts on any row: Cohort has no unread badges. The current item is the
 * filled ink tint; everything else answers the hand with the soft indent.
 */

const NO_FLAGS: Record<string, boolean> = {};
const FLAGS_KEY = "cohort-sidebar-groups";

function Row({
  href,
  icon,
  label,
  current,
  onNavigate,
  indent = false,
  trailing,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  current: boolean;
  onNavigate?: () => void;
  indent?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={`aff flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left ${indent ? "pl-7" : ""} ${
        current ? "text-sidebar-ink" : "text-sidebar-ink-2 hover:text-sidebar-ink"
      }`}
    >
      <span aria-hidden="true" className={current ? "text-sidebar-ink" : "text-sidebar-ink-3"}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

function Group({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`nav-${id}`}
          className="aff flex min-h-7 items-center gap-1 rounded-md px-2 text-label font-semibold uppercase tracking-[0.06em] text-sidebar-ink-3 hover:text-sidebar-ink-2"
        >
          {label}
          <ChevronDownIcon className={`h-3 w-3 ${open ? "" : "-rotate-90"}`} />
        </button>
      </h2>
      {open && (
        <div id={`nav-${id}`} className="mt-0.5 space-y-0.5">
          {children}
        </div>
      )}
    </section>
  );
}

function WorkspaceMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function onKey(e: React.KeyboardEvent) {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const item = "aff flex min-h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-body text-ink";

  return (
    <div ref={wrap} className="relative min-w-0 flex-1">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cohort workspace"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (!open && e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="aff flex h-9 max-w-full items-center gap-1.5 rounded-md px-1.5 text-sidebar-ink-3 hover:text-sidebar-ink"
      >
        <Image src="/cohort-wordmark-transparent.png" alt="" width={1550} height={440} priority className="h-auto w-[5.25rem]" />
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Workspace"
          onKeyDown={onKey}
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-64 rounded-lg border border-line-strong bg-canvas p-1 text-ink"
        >
          <div className="px-2 pb-1 pt-1.5 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">Workspace</div>
          <div className="flex items-start gap-2.5 px-2 py-1.5">
            <span className="mt-0.5 text-approved">
              <CheckIcon />
            </span>
            <span className="min-w-0">
              <span className="block text-body text-ink">Cohort</span>
              <span className="block text-meta text-ink-3">Reads this repository&rsquo;s harness. The one workspace there is.</span>
            </span>
          </div>
          <div role="separator" className="my-1 h-px bg-line" />
          <Link role="menuitem" tabIndex={-1} href="/" onClick={() => { setOpen(false); onNavigate?.(); }} className={item}>
            <span className="text-ink-3"><InboxIcon /></span>
            Welcome screen
          </Link>
          <Link role="menuitem" tabIndex={-1} href="/demo" onClick={() => { setOpen(false); onNavigate?.(); }} className={item}>
            <span className="text-ink-3"><PlayIcon /></span>
            Guided tour
          </Link>
          <p className="px-2 pb-1.5 pt-1 text-meta text-ink-3">
            To open another harness, run Cohort with <span className="font-mono text-label text-ink-2">HARNESS_ROOT</span>.
          </p>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  activeChannelId,
  onNavigate,
  onSearch,
}: {
  /** null on profile pages, so no channel row falsely reads as active. */
  activeChannelId: string | null;
  /** Closes the drawer on phones once a row is chosen. */
  onNavigate?: () => void;
  onSearch?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const reviewAgent = pathname.startsWith("/reviews") ? params.get("agent") : null;
  const [flags, setFlags] = useLocalState(FLAGS_KEY, NO_FLAGS, parseFlags);

  const on = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isOpen = (id: string, fallback: boolean) => flags[id] ?? fallback;
  const toggle = (id: string, fallback: boolean) => setFlags({ ...flags, [id]: !isOpen(id, fallback) });
  const agentIsHere = (id: AgentId) => pathname === `/agent/${id}` || activeChannelId === id || reviewAgent === id;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-line bg-sidebar text-sm shadow-2xl lg:shadow-none">
      <div className="flex items-center gap-0.5 px-2 pb-1 pt-2.5">
        <WorkspaceMenu onNavigate={onNavigate} />
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          data-tip="Search ⌘K"
          className="aff tip flex h-8 w-8 items-center justify-center rounded-md text-sidebar-ink-3 hover:text-sidebar-ink"
        >
          <SearchIcon />
        </button>
        <Link
          href="/c/claudia"
          onClick={onNavigate}
          aria-label="New agent task: brief Claudia"
          data-tip="New task"
          className="aff-fill tip flex h-8 w-8 items-center justify-center rounded-md text-sidebar-ink-2 hover:text-sidebar-ink"
        >
          <ComposeIcon />
        </Link>
      </div>

      <nav aria-label="Cohort" className="flex flex-1 flex-col overflow-y-auto px-2 pb-3 pt-1">
        <div className="space-y-0.5">
          <Row href="/reviews" icon={<InboxIcon />} label="Inbox" current={on("/reviews") && !reviewAgent} onNavigate={onNavigate} />
          <Row href="/agents" icon={<AgentsIcon />} label="My agents" current={on("/agents")} onNavigate={onNavigate} />
        </div>

        <Group id="workspace" label="Workspace" open={isOpen("workspace", true)} onToggle={() => toggle("workspace", true)}>
          <Row href="/board" icon={<BoardIcon />} label="Board" current={on("/board")} onNavigate={onNavigate} />
          <Row href="/timeline" icon={<TimelineIcon />} label="Project timeline" current={on("/timeline")} onNavigate={onNavigate} />
          <Row href="/memory" icon={<MemoryIcon />} label="Team memory" current={on("/memory")} onNavigate={onNavigate} />
          <Row
            href="/c/cohort"
            icon={<HashIcon />}
            label="cohort"
            current={activeChannelId === "cohort"}
            onNavigate={onNavigate}
          />
          <Row
            href="/c/design-crit"
            icon={<HashIcon />}
            label="design-crit"
            current={activeChannelId === "design-crit"}
            onNavigate={onNavigate}
          />
        </Group>

        <Group id="agents" label="Your agents" open={isOpen("agents", true)} onToggle={() => toggle("agents", true)}>
          {AGENT_ORDER.map((id) => {
            const agent = AGENTS[id];
            const expanded = isOpen(`agent-${id}`, agentIsHere(id));
            return (
              <div key={id}>
                <div className="flex items-center">
                  <Link
                    href={`/agent/${id}`}
                    onClick={onNavigate}
                    aria-current={pathname === `/agent/${id}` ? "page" : undefined}
                    className={`aff flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 ${
                      pathname === `/agent/${id}` ? "text-sidebar-ink" : "text-sidebar-ink-2 hover:text-sidebar-ink"
                    }`}
                  >
                    <Avatar agentId={id} size="sm" badge={false} />
                    <span className="min-w-0 flex-1 truncate">{agent.name}</span>
                    <span
                      className="flex shrink-0 items-center gap-1 text-label text-sidebar-ink-3"
                      title={`${agent.seniority}: a label, not a permission`}
                    >
                      {agent.seniority}
                      <RankTicks rank={agent.rank} />
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(`agent-${id}`, agentIsHere(id))}
                    aria-expanded={expanded}
                    aria-controls={`nav-agent-${id}`}
                    aria-label={`${expanded ? "Hide" : "Show"} ${agent.name}'s conversations and reviews`}
                    className="aff ml-0.5 flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-sidebar-ink-3 hover:text-sidebar-ink"
                  >
                    {expanded ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {expanded && (
                  <div id={`nav-agent-${id}`} className="mt-0.5 space-y-0.5">
                    <Row
                      indent
                      href={`/c/${id}`}
                      icon={<ChatIcon />}
                      label="Conversations"
                      current={activeChannelId === id}
                      onNavigate={onNavigate}
                    />
                    <Row
                      indent
                      href={`/reviews?agent=${id}`}
                      icon={<ReviewIcon />}
                      label="Reviews"
                      current={reviewAgent === id}
                      onNavigate={onNavigate}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Group>

        <div className="mt-auto">
        <Group id="try" label="Try" open={isOpen("try", true)} onToggle={() => toggle("try", true)}>
          <Row href="/settings#workspace" icon={<UserPlusIcon />} label="Invite people" current={false} onNavigate={onNavigate} />
          <Row href="/settings#workspace" icon={<BranchIcon />} label="Connect GitHub" current={false} onNavigate={onNavigate} />
        </Group>
        </div>
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-line px-2 py-3">
        <Link
          href="/demo"
          onClick={onNavigate}
          className="aff flex min-h-8 items-center gap-2 rounded-md px-2 text-meta text-sidebar-ink-2 hover:text-sidebar-ink"
        >
          <span aria-hidden="true" className="text-sidebar-ink-3">▶</span>
          Guided tour
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            onClick={onNavigate}
            aria-label="Settings"
            data-tip="Settings"
            aria-current={on("/settings") ? "page" : undefined}
            className={`aff tip flex h-8 w-8 items-center justify-center rounded-md ${
              on("/settings") ? "text-sidebar-ink" : "text-sidebar-ink-3 hover:text-sidebar-ink"
            }`}
          >
            <GearIcon />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ContextDoc } from "@/lib/harness";
import { Sidebar } from "./Sidebar";
import { ContextRail } from "./ContextRail";
import { CommandPalette } from "./CommandPalette";
import { LeadHandoffIndicator, type HandoffDetails } from "./LeadHandoffIndicator";
import { AGENTS } from "@/lib/agents";
import type { AgentStatus } from "@/lib/realtime/status";

const ACTIVITY_STATES: Array<{ label: string; details: HandoffDetails }> = [
  {
    label: "Checking scope...",
    details: {
      from: "Jesse",
      to: "Claudia",
      why: "A new request needs scope, routing, and dependency checks before workers touch it.",
      source: "Agents/planning.md",
      next: "Claudia turns intent into an executable task contract.",
    },
  },
  {
    label: "Assigning builder...",
    details: {
      from: "Claudia",
      to: "Augustus",
      why: "The lead has approved the path and is handing execution to a scoped builder.",
      source: "Agents/tasks/augustus.md",
      next: "Builder ships work back with notes, constraints, and changed files.",
    },
  },
  {
    label: "Reviewing fixes...",
    details: {
      from: "Augustus",
      to: "Athena",
      why: "Execution is separate from judgment, so review happens before work is called done.",
      source: "Agents/handoffs/",
      next: "Reviewer either approves, requests fixes, or writes a lesson.",
    },
  },
  {
    label: "Writing to record...",
    details: {
      from: "Athena",
      to: "Cohort memory",
      why: "The outcome needs to become durable context, not disappear into chat history.",
      source: "Agents/lessons/INDEX.md",
      next: "Future agents read the updated record before acting.",
    },
  },
];

export function AppShell({
  activeChannelId,
  header,
  contextDocs,
  citedDocs,
  loadingContext,
  liveStatuses,
  presence,
  children,
}: {
  /** null on profile pages, so no channel row falsely reads as active. */
  activeChannelId: string | null;
  header: ReactNode;
  contextDocs: ContextDoc[];
  /** Documents the agent surfaced in conversation, shown above channel pins. */
  citedDocs?: ContextDoc[];
  loadingContext: boolean;
  /**
   * What the harness says agents are doing right now. When this is empty the
   * header falls back to the illustrative rotation, and says so when opened.
   */
  liveStatuses?: AgentStatus[];
  /** Who else is looking at this channel. Rendered beside the status line. */
  presence?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);

  // A live status always wins. The rotation is what fills a silent header, not
  // a thing that competes with a real event.
  const live = liveStatuses?.[0];
  const activity = live
    ? {
        label: live.label,
        details: {
          from: AGENTS[live.agentId]?.name ?? live.agentId,
          to: "Cohort",
          why: live.detail ?? "Reported by the harness as it happened.",
          source: `Agents/tasks/${live.agentId}.md`,
          next: liveStatuses && liveStatuses.length > 1
            ? `${liveStatuses.length - 1} other agent${liveStatuses.length > 2 ? "s" : ""} also active.`
            : "Waiting on the next event from this agent.",
        } satisfies HandoffDetails,
      }
    : ACTIVITY_STATES[activityIndex];

  // Cmd/Ctrl-K opens search from anywhere, the way Slack and Notion do.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close both drawers whenever the route's subject changes.
  useEffect(() => {
    setSidebarOpen(false);
    setRailOpen(false);
  }, [activeChannelId]);

  // Only runs while there is nothing real to show.
  useEffect(() => {
    if (live) return;
    const timer = window.setInterval(() => {
      setActivityIndex((i) => (i + 1) % ACTIVITY_STATES.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [live]);

  const overlayOpen = sidebarOpen || railOpen;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-canvas">
      {overlayOpen && (
        <button
          aria-label="Close panel"
          onClick={() => {
            setSidebarOpen(false);
            setRailOpen(false);
          }}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activeChannelId={activeChannelId}
          onSelect={(id) => {
            setSidebarOpen(false);
            router.push(`/c/${id}`);
          }}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3 lg:px-5">
          <button
            aria-label="Open channels"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:hidden"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0 flex-1">{header}</div>

          {/* Last thing to earn space: the channel name has to stay readable
              before the room does. */}
          {presence && <div className="hidden shrink-0 lg:flex">{presence}</div>}

          <div className="hidden shrink-0 md:flex">
            <LeadHandoffIndicator
              label={activity.label}
              details={activity.details}
              compact
              scripted={!live}
            />
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-md text-[12px] text-ink-3 transition-colors hover:bg-hover hover:text-ink-2 sm:h-auto sm:w-auto sm:border sm:border-line-strong sm:px-2.5 sm:py-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7.2" cy="7.2" r="4.6" stroke="currentColor" strokeWidth="1.4" />
              <path d="m10.7 10.7 2.8 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-line px-1 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>

          <button
            aria-label="Open pinned context"
            onClick={() => setRailOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:hidden"
          >
            <InfoIcon />
          </button>
        </header>

        {children}
      </main>

      <div
        className={`fixed inset-y-0 right-0 z-40 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          railOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ContextRail
          docs={contextDocs}
          citedDocs={citedDocs}
          channelId={activeChannelId ?? undefined}
          loading={loadingContext}
        />
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8v4.5M9 5.75v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ContextDoc } from "@/lib/harness";
import { Sidebar } from "./Sidebar";
import { ContextRail } from "./ContextRail";
import { CommandPalette } from "./CommandPalette";
import { LeadHandoffIndicator, type HandoffDetails } from "./LeadHandoffIndicator";
import { AgentActivityBar } from "./AgentActivityBar";
import type { AgentStatus } from "@/lib/realtime/status";
import { InfoIcon, MenuIcon, SearchIcon } from "./Icons";

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

  // Two different things, so two different components. One agent's handoff is
  // a sentence; a roster of them working at once is a board, and squeezing the
  // second into the shape of the first is what limited the header before.
  const live = (liveStatuses?.length ?? 0) > 0;
  const activity = ACTIVITY_STATES[activityIndex];

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
          className="fixed inset-0 z-30 bg-scrim lg:hidden"
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
        <header className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-2 lg:px-6">
          <button
            aria-label="Open channels"
            onClick={() => setSidebarOpen(true)}
            className="aff flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-3 hover:text-ink lg:hidden"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0 flex-1">{header}</div>

          {/* Last thing to earn space: the channel name has to stay readable
              before the room does. */}
          {presence && <div className="hidden shrink-0 lg:flex">{presence}</div>}

          <div className="hidden shrink-0 md:flex">
            {live ? (
              <AgentActivityBar statuses={liveStatuses ?? []} />
            ) : (
              <LeadHandoffIndicator label={activity.label} details={activity.details} variant="line" />
            )}
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="aff flex h-10 w-10 items-center justify-center gap-2 rounded-md text-meta text-ink-3 hover:text-ink sm:h-8 sm:w-auto sm:px-2"
          >
            <SearchIcon />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden font-mono text-label text-ink-3 sm:inline">
              ⌘K
            </kbd>
          </button>

          <button
            aria-label="Open pinned context"
            onClick={() => setRailOpen(true)}
            className="aff flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-3 hover:text-ink lg:hidden"
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

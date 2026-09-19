"use client";

import { useEffect, useState } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getTimeline, getTimelineSummary } from "@/lib/timeline";
import type { AgentCustomization } from "@/lib/roster";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { AgentTimeline } from "./AgentTimeline";
import { AgentEditor } from "./AgentEditor";
import { AgentMasthead } from "./AgentMasthead";
import { Avatar } from "./Avatar";

export function AgentProfile({ agentId }: { agentId: AgentId }) {
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [custom, setCustom] = useState<AgentCustomization | null>(null);
  const [editing, setEditing] = useState(false);

  const agent = AGENTS[agentId];
  const entries = getTimeline(agentId);
  const summary = getTimelineSummary(agentId);

  useEffect(() => {
    let active = true;
    setLoadingContext(true);
    setEditing(false);

    fetch(`/api/context/${agentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        setContextDocs(json.docs ?? []);
        setLoadingContext(false);
      })
      .catch(() => active && setLoadingContext(false));

    fetch(`/api/roster/${agentId}`)
      .then((r) => r.json())
      .then((json) => active && setCustom(json.customization ?? null))
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [agentId]);

  const name = custom?.displayName ?? agent.name;
  const title = custom?.title ?? agent.title;

  /**
   * Deliberately still one row. This is shared chrome — search, presence and
   * the activity board sit beside it on every route — so the page's subject
   * gets a masthead in the scroll instead, and this stays the identity strip
   * that survives once the masthead is scrolled past. The name alone answers
   * what this strip is for.
   *
   * The trust chip came off it. Everything the chip opens to say now reads
   * without a click a few pixels below — role and boundary in the masthead,
   * authority in the rank caption, evidence in the stats row — and the chip
   * would not shrink, so in a row already holding the activity board and
   * search it overlapped Customize rather than giving way. Message #agent
   * moved to the masthead for the same reason: this slot tops out near 260px,
   * and two rigid buttons in it left the name four pixels wide.
   */
  const header = (
    <div className="flex items-center gap-3">
      <Avatar agentId={agentId} size="md" />
      <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {name}
      </h2>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-colors hover:bg-hover hover:text-ink"
        >
          {editing ? "Close" : "Customize"}
        </button>
      </div>
    </div>
  );

  return (
    <AppShell
      activeChannelId={null}
      header={header}
      contextDocs={contextDocs}
      loadingContext={loadingContext}
    >
      {editing && custom && (
        <div className="border-b border-line px-4 py-4 lg:px-6">
          <div className="mx-auto max-w-2xl">
            <AgentEditor
              agentId={agentId}
              value={custom}
              onChange={setCustom}
              onClose={() => setEditing(false)}
            />
          </div>
        </div>
      )}
      <AgentTimeline
        entries={entries}
        summary={summary}
        masthead={<AgentMasthead agentId={agentId} name={name} title={title} />}
      />
    </AppShell>
  );
}

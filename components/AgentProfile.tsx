"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getTimeline, getTimelineSummary } from "@/lib/timeline";
import type { AgentCustomization } from "@/lib/roster";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { AgentTimeline } from "./AgentTimeline";
import { AgentEditor } from "./AgentEditor";
import { Avatar } from "./Avatar";
import { AgentTrustChip } from "./AgentTrustChip";

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

  const header = (
    <div className="flex items-center gap-3">
      <Avatar agentId={agentId} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
            {name}
          </h1>
          <AgentTrustChip agentId={agentId} compact />
        </div>
        <p className="truncate text-[11px] text-ink-3">{title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-colors hover:bg-hover hover:text-ink"
        >
          {editing ? "Close" : "Customize"}
        </button>
        <Link
          href={`/c/${agentId}`}
          className="hidden rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-colors hover:bg-hover hover:text-ink sm:block"
        >
          Message #{agentId}
        </Link>
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
      <AgentTimeline entries={entries} summary={summary} />
    </AppShell>
  );
}

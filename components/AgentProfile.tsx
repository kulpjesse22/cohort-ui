"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getTimeline, getTimelineSummary } from "@/lib/timeline";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { AgentTimeline } from "./AgentTimeline";
import { Avatar } from "./Avatar";

export function AgentProfile({ agentId }: { agentId: AgentId }) {
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  const agent = AGENTS[agentId];
  const entries = getTimeline(agentId);
  const summary = getTimelineSummary(agentId);

  useEffect(() => {
    let active = true;
    setLoadingContext(true);

    fetch(`/api/context/${agentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setContextDocs(json.docs ?? []);
        setLoadingContext(false);
      })
      .catch(() => {
        if (!active) return;
        setContextDocs([]);
        setLoadingContext(false);
      });

    return () => {
      active = false;
    };
  }, [agentId]);

  const header = (
    <div className="flex items-center gap-3">
      <Avatar agentId={agentId} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h1 className="truncate font-semibold text-zinc-100">{agent.name}</h1>
          <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
            {agent.seniority}
          </span>
        </div>
        <p className="truncate text-xs text-zinc-500">{agent.title}</p>
      </div>
      <Link
        href={`/c/${agentId}`}
        className="hidden shrink-0 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 sm:block"
      >
        Message #{agentId}
      </Link>
    </div>
  );

  return (
    <AppShell
      activeChannelId={null}
      header={header}
      contextDocs={contextDocs}
      loadingContext={loadingContext}
    >
      <AgentTimeline entries={entries} summary={summary} />
    </AppShell>
  );
}

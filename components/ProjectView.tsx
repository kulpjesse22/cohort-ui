"use client";

import { useEffect, useState } from "react";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { TeamTimeline } from "./TeamTimeline";

export function ProjectView() {
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    let active = true;

    // The project view pins the planner's own docs: what this project is, and
    // what is currently queued.
    fetch("/api/context/claudia")
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        setContextDocs(json.docs ?? []);
        setLoadingContext(false);
      })
      .catch(() => active && setLoadingContext(false));

    return () => {
      active = false;
    };
  }, []);

  const header = (
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-semibold text-zinc-100">Project timeline</h1>
      <p className="truncate text-xs text-zinc-500">
        All work across the team — humans and agents — newest first.
      </p>
    </div>
  );

  return (
    <AppShell
      activeChannelId={null}
      header={header}
      contextDocs={contextDocs}
      loadingContext={loadingContext}
    >
      <TeamTimeline />
    </AppShell>
  );
}

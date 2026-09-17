"use client";

import { useEffect, useState } from "react";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { LessonLadder } from "./LessonLadder";

export function MemoryView() {
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    let active = true;

    // Pin the planner's docs: lessons are Claudia-owned, and the standing gates
    // she promotes live in project_context.md.
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
    <div className="min-w-0">
      <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
        Team memory
      </h1>
      <p className="truncate text-[11px] text-ink-3">
        What the team learned the hard way, and what it does about it.
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
      <LessonLadder />
    </AppShell>
  );
}

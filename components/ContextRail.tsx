"use client";

import { useState } from "react";
import type { ContextDoc } from "@/lib/harness";

function RailSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 w-32 rounded bg-raised" />
          <div className="h-20 rounded border border-line bg-raised" />
        </div>
      ))}
    </div>
  );
}

export function ContextRail({ docs, loading }: { docs: ContextDoc[]; loading: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-line bg-panel shadow-2xl lg:shadow-none">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between border-b border-line px-4 py-3 text-left"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
          Pinned repo context
        </span>
        <span className="text-xs text-ink-3">{open ? "✕" : "+"}</span>
      </button>

      {open &&
        (loading ? (
          <RailSkeleton />
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {docs.length === 0 && (
              <p className="text-xs text-ink-3">Nothing pinned for this channel.</p>
            )}
            {docs.map((doc) => (
              <div key={doc.path}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink-2">{doc.label}</span>
                  <span className="truncate text-[10px] text-ink-4">{doc.path}</span>
                </div>
                {doc.content === null ? (
                  <p className="rounded border border-dashed border-line px-2 py-2 text-[11px] text-ink-4">
                    Not found in the harness repo.
                  </p>
                ) : doc.content.length === 0 ? (
                  <p className="rounded border border-dashed border-line px-2 py-2 text-[11px] text-ink-4">
                    Empty — this file is still an unfilled template.
                  </p>
                ) : (
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded border border-line bg-raised px-2 py-2 text-[11px] leading-relaxed text-ink-2">
                    {doc.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ))}
    </aside>
  );
}

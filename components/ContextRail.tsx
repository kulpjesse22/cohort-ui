"use client";

import { useEffect, useState } from "react";
import type { ContextDoc } from "@/lib/harness";
import { DocPreview } from "./DocPreview";

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

export function ContextRail({
  docs,
  loading,
  citedDocs = [],
  channelId,
}: {
  docs: ContextDoc[];
  loading: boolean;
  /** Documents the agent put on the table in this conversation. */
  citedDocs?: ContextDoc[];
  channelId?: string;
}) {
  const [open, setOpen] = useState(true);
  const [canon, setCanon] = useState<string | null>(null);
  const [pinning, setPinning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/canon")
      .then((r) => r.json())
      .then((d) => active && setCanon(d.path ?? null))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [citedDocs.length]);

  async function pin(path: string) {
    setPinning(path);
    try {
      const res = await fetch("/api/canon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, channelId }),
      });
      const d = await res.json();
      setCanon(d.canon ?? path);
    } finally {
      setPinning(null);
    }
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-line bg-panel shadow-2xl lg:shadow-none">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between border-b border-line px-4 py-3 text-left"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
          {citedDocs.length ? "On the table" : "Pinned repo context"}
        </span>
        <span className="text-xs text-ink-3">{open ? "✕" : "+"}</span>
      </button>

      {open &&
        (loading ? (
          <RailSkeleton />
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {/* What the agent just put up, ahead of the channel's standing
                pins — this is the live subject of the conversation, and it is
                where the human names one authoritative. */}
            {citedDocs.map((doc) => (
              <DocPreview
                key={`cited-${doc.path}`}
                path={doc.path}
                content={doc.content}
                isCanon={canon === doc.path}
                action={
                  canon === doc.path ? null : doc.content ? (
                    <button
                      onClick={() => pin(doc.path)}
                      disabled={pinning === doc.path}
                      className="text-[11px] text-ink-3 underline decoration-dotted underline-offset-2 transition-colors hover:text-ink disabled:opacity-50"
                    >
                      {pinning === doc.path ? "Noting…" : "Set as source of truth"}
                    </button>
                  ) : null
                }
              />
            ))}

            {citedDocs.length > 0 && docs.length > 0 && (
              <div className="border-t border-line pt-3 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-4">
                Channel context
              </div>
            )}

            {docs.length === 0 && citedDocs.length === 0 && (
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

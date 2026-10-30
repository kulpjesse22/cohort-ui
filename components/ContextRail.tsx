"use client";

import { useEffect, useState } from "react";
import type { ContextDoc } from "@/lib/harness";
import { DocPreview } from "./DocPreview";
import { ProvenanceMark, ProvenanceTag } from "./Marks";

function RailSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 w-32 rounded bg-raised" />
          <div className="h-20 rounded bg-raised" />
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
        aria-expanded={open}
        className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 text-left"
      >
        <span className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
          {citedDocs.length ? "On the table" : "Pinned repo context"}
        </span>
        <span className="flex items-center gap-3">
          <ProvenanceTag kind="live" title="Read off disk on this request">
            Live from disk
          </ProvenanceTag>
          <span className="text-meta text-ink-3" aria-hidden="true">{open ? "−" : "+"}</span>
        </span>
      </button>

      {open &&
        (loading ? (
          <RailSkeleton />
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
            {/* What the agent just put up, ahead of the channel's standing
                pins — this is the live subject of the conversation, and it is
                where the human names one authoritative. */}
            {citedDocs.map((doc) => (
              <DocPreview
                key={`cited-${doc.path}`}
                path={doc.path}
                content={doc.content}
                state={
                  canon === doc.path ? "canon" : canon ? "considered" : "neutral"
                }
                action={
                  canon === doc.path ? (
                    <span className="text-meta text-ink-3">chosen</span>
                  ) : doc.content ? (
                    <button
                      onClick={() => pin(doc.path)}
                      disabled={pinning === doc.path}
                      className="text-meta text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink disabled:opacity-40"
                    >
                      {pinning === doc.path ? "Noting…" : "Set as source of truth"}
                    </button>
                  ) : null
                }
              />
            ))}

            {citedDocs.length > 0 && docs.length > 0 && (
              <div className="border-t border-line pt-3 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
                Channel context
              </div>
            )}

            {docs.length === 0 && citedDocs.length === 0 && (
              <p className="text-meta text-ink-3">Nothing pinned for this channel.</p>
            )}
            {docs.map((doc) => (
              <div key={doc.path}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="shrink-0 text-meta font-semibold text-ink">{doc.label}</span>
                  <span className="truncate font-mono text-label text-ink-3" title={doc.path}>
                    {doc.path}
                  </span>
                </div>
                {/* Three states, three shapes: missing is a struck ring, an
                    unfilled template a dashed one, a real file its text. */}
                {doc.content === null ? (
                  <p className="flex items-center gap-2 border-t border-line pt-2 text-meta text-ink-3">
                    <MissingMark />
                    Not found in the harness repo.
                  </p>
                ) : doc.content.length === 0 ? (
                  <p className="flex items-center gap-2 border-t border-line pt-2 text-meta text-ink-3">
                    <ProvenanceMark kind="illustrative" />
                    Empty. This file is still an unfilled template.
                  </p>
                ) : (
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap border-l border-line-strong pl-3 font-mono text-label leading-relaxed text-ink-2">
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

function MissingMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.8 7.2 7.2 2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

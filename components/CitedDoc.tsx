"use client";

import { useEffect, useState } from "react";
import { ArtifactLink } from "./ArtifactLink";

/**
 * A cited file, previewed in the thread.
 *
 * A bare link makes the room take the citation on trust until somebody clicks.
 * Showing the opening of the file puts the evidence on screen immediately —
 * while the path stays the headline, so it is unmistakable that this is a
 * window onto a file rather than something the agent composed in chat.
 *
 * Fetched live rather than carried in the message. If the file changes, this
 * changes; a copy pasted into the reply would start lying the moment someone
 * edited it, which is the failure this product exists to argue against.
 */

const PREVIEW_LINES = 8;

function excerpt(content: string): { text: string; truncated: boolean } {
  const lines = content
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  return {
    text: lines.slice(0, PREVIEW_LINES).join("\n"),
    truncated: lines.length > PREVIEW_LINES,
  };
}

export function CitedDoc({
  path,
  channelId,
  onPinned,
}: {
  path: string;
  channelId?: string;
  /** Lets the thread show the planner's acknowledgement immediately. */
  onPinned?: (reply: unknown) => void;
}) {
  const [state, setState] = useState<{ text: string; truncated: boolean; exists: boolean } | null>(
    null
  );
  const [canon, setCanon] = useState<string | null>(null);
  const [pinning, setPinning] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/canon")
      .then((r) => r.json())
      .then((d) => active && setCanon(d.path ?? null))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function pin() {
    setPinning(true);
    try {
      const res = await fetch("/api/canon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, channelId }),
      });
      const data = await res.json();
      setCanon(data.canon ?? path);
      if (data.reply) onPinned?.(data.reply);
    } finally {
      setPinning(false);
    }
  }

  const isCanon = canon === path;

  useEffect(() => {
    let active = true;
    fetch(`/api/doc?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (!d.exists || !d.content) {
          setState({ text: "", truncated: false, exists: false });
          return;
        }
        setState({ ...excerpt(d.content), exists: true });
      })
      .catch(() => active && setState({ text: "", truncated: false, exists: false }));
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[11px] text-ink-3">{path}</span>
          {isCanon && (
            <span className="shrink-0 text-[10px] font-medium text-approved">
              source of truth
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          {state?.exists && !isCanon && (
            <button
              onClick={pin}
              disabled={pinning}
              className="text-[11px] text-ink-3 underline decoration-dotted underline-offset-2 transition-colors hover:text-ink disabled:opacity-50"
            >
              {pinning ? "Noting…" : "Set as source of truth"}
            </button>
          )}
          <ArtifactLink path={path} />
        </span>
      </div>

      {state === null ? (
        <div className="animate-pulse space-y-1.5 px-3 py-2.5">
          <div className="h-2.5 w-2/3 rounded bg-raised" />
          <div className="h-2.5 w-1/2 rounded bg-raised" />
        </div>
      ) : state.exists ? (
        <>
          <pre className="max-h-40 overflow-hidden whitespace-pre-wrap px-3 py-2.5 text-[11px] leading-relaxed text-ink-2">
            {state.text}
          </pre>
          {state.truncated && (
            <div className="px-3 pb-2 text-[11px] text-ink-4">
              Opening lines only — the file is the source, not this preview.
            </div>
          )}
        </>
      ) : (
        <p className="px-3 py-2.5 text-[11px] text-ink-4">
          Not in the repository yet. That is a gap to close in the file rather
          than answer from memory.
        </p>
      )}
    </div>
  );
}

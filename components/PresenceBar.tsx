"use client";

import type { Viewer } from "@/lib/realtime/presence";

/**
 * Presence, as distinct from membership.
 *
 * The facepile answers "who belongs in this channel". This answers "who is
 * looking at it right now" — a claim with a fifteen-second shelf life, made
 * only because there is now a heartbeat behind it. Nobody appears here without
 * a live beat, so an empty bar is a fact, not a missing feature.
 *
 * Yourself is filtered out upstream. A dot for the person reading the screen
 * is noise.
 */
function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function typingLine(names: string[]): string {
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names.length} people are typing`;
}

export function PresenceBar({
  viewers,
  connected,
}: {
  viewers: Viewer[];
  /** False while the stream is down, so a stale room does not read as an empty one. */
  connected: boolean;
}) {
  const typing = viewers.filter((v) => v.typing).map((v) => v.name);

  if (!connected) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-ink-3" title="Reconnecting to the live stream">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-3/60" aria-hidden="true" />
        Offline
      </span>
    );
  }

  if (viewers.length === 0) {
    return <span className="text-[11px] text-ink-3">Only you</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5">
        {viewers.slice(0, 4).map((v) => (
          <span
            key={v.sessionId}
            title={`${v.name} is here${v.typing ? " and typing" : ""}`}
            className={`flex h-6 w-6 items-center justify-center rounded-full border border-canvas bg-hover text-[9px] font-medium text-ink-2 ${
              v.typing ? "ring-1 ring-emerald-400/70" : ""
            }`}
          >
            {initials(v.name)}
          </span>
        ))}
        {viewers.length > 4 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-canvas bg-hover text-[9px] text-ink-3">
            +{viewers.length - 4}
          </span>
        )}
      </div>
      <span className="hidden text-[11px] text-ink-3 lg:inline">
        {typing.length > 0
          ? typingLine(typing)
          : `${viewers.length} other${viewers.length === 1 ? "" : "s"} here`}
      </span>
    </div>
  );
}

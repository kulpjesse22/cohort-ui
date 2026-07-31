"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getParticipant, isAgent, type ActorId } from "@/lib/agents";
import { getTimeline } from "@/lib/timeline";
import { Avatar } from "./Avatar";

/**
 * Membership, not presence.
 *
 * Figma and Google Docs show who is live in the document right now. Cohort has
 * no presence system — no sessions, no sockets, nobody is "online" — so a
 * live-looking facepile would be inventing a layer that does not exist.
 *
 * Instead this shows who belongs here and when they were last active, taken
 * straight from the timeline. Same visual texture, every claim backed by an
 * entry.
 */

function lastActive(id: ActorId): { label: string; title: string } | null {
  const entries = getTimeline(id);
  if (entries.length === 0) return null;

  const latest = entries[0];
  const days = Math.round(
    (Date.now() - new Date(`${latest.date}T12:00:00Z`).getTime()) / 86_400_000
  );

  const label =
    days <= 0 ? "today" : days === 1 ? "yesterday" : days < 30 ? `${days}d ago` : `${Math.round(days / 30)}mo ago`;

  return { label, title: `${latest.title} · ${latest.date}` };
}

export function Facepile({
  memberIds,
  label = "In this channel",
}: {
  memberIds: ActorId[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (memberIds.length === 0) return null;

  const shown = memberIds.slice(0, 4);
  const overflow = memberIds.length - shown.length;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${memberIds.length} members`}
        className="flex items-center gap-1.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-hover"
      >
        <span className="flex -space-x-1.5">
          {shown.map((id) => (
            <span key={id} className="rounded-[6px] ring-2 ring-canvas">
              <Avatar agentId={id} size="sm" badge={false} />
            </span>
          ))}
          {overflow > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-raised text-[9px] font-medium text-ink-2 ring-2 ring-canvas">
              +{overflow}
            </span>
          )}
        </span>
        <span className="text-[11px] text-ink-3">{memberIds.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-64 overflow-hidden rounded-lg border border-line-strong bg-canvas py-1 shadow-2xl">
          <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
            {label}
          </div>
          {memberIds.map((id) => {
            const p = getParticipant(id);
            if (!p) return null;
            const active = lastActive(id);
            const row = (
              <>
                <Avatar agentId={id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-ink">{p.name}</span>
                  <span className="block truncate text-[11px] text-ink-3">{p.title}</span>
                </span>
                {active && (
                  <span
                    title={active.title}
                    className="shrink-0 text-[10px] text-ink-4"
                  >
                    {active.label}
                  </span>
                )}
              </>
            );

            return isAgent(id) ? (
              <Link
                key={id}
                href={`/agent/${id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-hover"
              >
                {row}
              </Link>
            ) : (
              <div key={id} className="flex items-center gap-2 px-3 py-1.5">
                {row}
              </div>
            );
          })}
          <p className="border-t border-line px-3 py-2 text-[10px] leading-relaxed text-ink-4">
            Times are last recorded activity, not presence.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS, AGENT_ORDER, type AgentId } from "@/lib/agents";
import type { AgentStatus } from "@/lib/realtime/status";
import { Avatar } from "./Avatar";

/**
 * The roster, live.
 *
 * The header used to show one thing happening, because only one thing could be
 * known. Now the stream carries a status per agent, and the interesting case is
 * the one a single line cannot express: three agents working at once, on
 * different files, for different reasons.
 *
 * Ordered by the roster rather than by recency. A board that reshuffles every
 * time an event lands is unreadable — you would have to find an agent before
 * you could read them. Position is identity here; only the state moves.
 */
const REFRESH_MS = 10_000;

function hueClass(agentId: AgentId): string {
  return `agent-${AGENTS[agentId]?.color ?? "violet"}`;
}

/**
 * Deliberately coarse. The feed refreshes inside a ninety-second window, so
 * second-by-second precision would imply a resolution the data does not have.
 */
function age(ts: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - ts) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

export function AgentActivityBar({ statuses }: { statuses: AgentStatus[] }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const wrapRef = useRef<HTMLDivElement>(null);

  const active = [...statuses].sort(
    (a, b) => AGENT_ORDER.indexOf(a.agentId) - AGENT_ORDER.indexOf(b.agentId)
  );

  // Ages have to keep moving even when no event arrives, or "just now" sits
  // there being wrong.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (active.length === 0) return null;

  const summary =
    active.length === 1
      ? active[0].label
      : `${active.length} agents working`;

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${active.length} agent${active.length === 1 ? "" : "s"} working. Open activity details`}
        className="flex max-w-[18rem] items-center gap-2 rounded-full border border-line-strong bg-canvas py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong"
      >
        <span className="flex -space-x-1.5">
          {active.map((s) => (
            <span key={s.agentId} className="relative inline-flex">
              <Avatar agentId={s.agentId} size="sm" badge={false} />
              <span
                aria-hidden="true"
                className={`${hueClass(s.agentId)} agent-live-dot absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-canvas`}
              />
            </span>
          ))}
        </span>
        <span className="truncate text-[12px] font-medium tracking-[-0.01em] text-ink-2">
          {summary}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-lg border border-line-strong bg-canvas p-3 text-left shadow-2xl">
          <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Working now
          </div>

          <ul className="mt-2 flex flex-col gap-3">
            {active.map((s) => (
              <li key={s.agentId} className="flex gap-2.5">
                <Avatar agentId={s.agentId} size="sm" badge={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`${hueClass(s.agentId)} agent-fg text-[12px] font-semibold`}>
                      {AGENTS[s.agentId]?.name ?? s.agentId}
                    </span>
                    <span className="shrink-0 text-[10px] text-ink-3">{age(s.ts, now)}</span>
                  </div>
                  <p className="text-[12px] leading-4 text-ink">{s.label}</p>
                  {s.detail && (
                    <p className="mt-0.5 text-[11px] leading-4 text-ink-3">{s.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-3 border-t border-line pt-2 text-[11px] leading-4 text-ink-3">
            Live. Reported by the harness as it works, and dropped after ninety
            seconds of silence rather than left standing.
          </p>
        </div>
      )}
    </div>
  );
}

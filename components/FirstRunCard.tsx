"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENT_ORDER } from "@/lib/agents";
import { Avatar } from "./Avatar";

const SEEN_KEY = "cohort-seen-tour";

/**
 * First-run invitation to the guided tour.
 *
 * Shown by default and only until it is dismissed or taken — someone opening a
 * shared link arrives cold and should not have to find the tour in a sidebar
 * footer. Returning visitors get the quiet button there instead.
 *
 * Rendered after mount rather than guessed on the server: whether it should
 * appear lives in localStorage, and assuming either way produces a flash.
 */
export function FirstRunCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(!localStorage.getItem(SEEN_KEY));
    } catch {
      // Private mode or blocked storage: skip the card rather than nag.
    }
  }, []);

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* nothing to persist to; dismissing for this session is enough */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="mb-6 rounded-xl border border-line bg-raised px-4 py-4 lg:px-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex -space-x-1.5">
            {AGENT_ORDER.map((id) => (
              <span key={id} className="rounded-[6px] ring-2 ring-raised">
                <Avatar agentId={id} size="sm" badge={false} />
              </span>
            ))}
          </div>

          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Five agents, one shared record
          </h2>
          <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-ink-2">
            A planner, two builders, and two reviewers — each with a fixed role,
            a track record, and a repository as their memory. The tour walks the
            whole loop in about ninety seconds, including an agent getting work
            sent back and earning a promotion for it.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/demo"
              onClick={markSeen}
              className="flex items-center gap-1.5 rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink transition-opacity hover:opacity-90"
            >
              <span aria-hidden="true">▶</span>
              Take the tour
            </Link>
            <button
              onClick={markSeen}
              className="rounded-md border border-line-strong px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-hover hover:text-ink"
            >
              Explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

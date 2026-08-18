"use client";

import { useEffect, useState } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getTimelineSummary } from "@/lib/timeline";

const HUE: Record<AgentId, string> = {
  claudia: "agent-violet",
  augustus: "agent-sky",
  julius: "agent-teal",
  athena: "agent-amber",
  hephaestus: "agent-rose",
};

export function AgentTrustChip({
  agentId,
  compact = false,
  forceOpen = false,
}: {
  agentId: AgentId;
  compact?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const agent = AGENTS[agentId];
  const summary = getTimelineSummary(agentId);
  const visible = open || forceOpen;

  useEffect(() => {
    setOpen(false);
  }, [agentId]);

  return (
    <span className={`${HUE[agentId]} agent-trust relative inline-flex items-center`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`agent-trust-pill inline-flex items-center gap-1.5 rounded-full border bg-canvas font-semibold text-current outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-line-strong ${
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
        }`}
        aria-label={`${agent.name} trust chip. Open agent details`}
        aria-expanded={visible}
      >
        <span
          className={`relay-token rounded-full ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          aria-hidden="true"
        />
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="handoff-dot h-1 w-1 rounded-full bg-current"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
        <span>{agent.seniority}</span>
      </button>

      {visible && (
        <div className="agent-trust-popover absolute left-1/2 top-[calc(100%+0.6rem)] z-50 w-[19rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-line-strong bg-canvas p-3 text-left text-ink shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Agent trust
              </div>
              <div className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-ink">
                {agent.name} · {agent.seniority}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink ${
                forceOpen ? "invisible" : ""
              }`}
              aria-label="Close agent details"
            >
              ×
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-[12px] leading-5">
            <dt className="text-ink-3">Role</dt>
            <dd className="text-ink-2">{agent.title}</dd>
            <dt className="text-ink-3">Evidence</dt>
            <dd className="text-ink-2">
              {summary.tasks} tasks · {summary.reviewsPassed}/{summary.reviewsTotal} reviews passed ·{" "}
              {summary.lessons} lesson logged
            </dd>
            <dt className="text-ink-3">Boundary</dt>
            <dd className="text-ink-2">{agent.blurb}</dd>
            <dt className="text-ink-3">Next</dt>
            <dd className="text-ink-2">
              More autonomy only after clean reviews and captured lessons.
            </dd>
          </dl>
        </div>
      )}
    </span>
  );
}

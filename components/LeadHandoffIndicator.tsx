"use client";

import { useEffect, useState } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { ProvenanceMark } from "./Marks";

const PARTICIPANTS: AgentId[] = ["julius", "augustus", "claudia"];

export interface HandoffDetails {
  from: string;
  to: string;
  why: string;
  source: string;
  next: string;
}

export function LeadHandoffIndicator({
  label = "Sending to Lead...",
  compact = false,
  details,
  forceOpen = false,
  variant = "relay",
}: {
  label?: string;
  compact?: boolean;
  details?: HandoffDetails;
  forceOpen?: boolean;
  /**
   * "relay" is the animated strip, for places where the handoff is the
   * subject (the welcome preview, the tour). "line" is for app chrome, where
   * it sits beside the page's real subject and has to stay quiet: one line of
   * text behind a dashed ring that says, before any click, nothing is running.
   */
  variant?: "relay" | "line";
}) {
  const [open, setOpen] = useState(false);
  const interactive = Boolean(details);
  const visible = Boolean(details) && (open || forceOpen);

  useEffect(() => {
    setOpen(false);
  }, [label]);

  if (variant === "line") {
    return (
      <div className="relative">
        <button
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setOpen((v) => !v)}
          aria-expanded={interactive ? visible : undefined}
          aria-label={interactive ? `Illustrative: ${details?.from} to ${details?.to}, ${label} Open handoff details` : label}
          className="flex min-h-8 max-w-[18rem] items-center gap-2 rounded-md px-2 text-meta text-ink-2 transition-colors hover:bg-hover hover:text-ink"
        >
          <ProvenanceMark kind="illustrative" />
          {details && (
            <span className="shrink-0 font-semibold text-ink">
              {details.from} <span className="font-normal text-ink-3" aria-hidden="true">→</span> {details.to}
            </span>
          )}
          <span className="truncate">{label}</span>
        </button>
        {visible && details && (
          <HandoffDetailsPanel label={label} details={details} forceOpen={forceOpen} onClose={() => setOpen(false)} align="end" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`lead-handoff relative flex items-center justify-center ${
        compact ? "scale-[0.82]" : ""
      }`}
    >
      {/* The current. Three batons, phase-offset in CSS, running independently
          of whatever step the app is on — nothing about this restarts when the
          label changes, because a restart is a jump. */}
      <span className="handoff-track z-30" aria-hidden="true">
        <span className="handoff-baton" />
        <span className="handoff-baton" />
        <span className="handoff-baton" />
      </span>

      <span className="handoff-kiss-send flex -space-x-2">
        {PARTICIPANTS.slice(0, 2).map((id) => (
          <HandoffBead key={id} agentId={id} />
        ))}
      </span>

      <button
        type="button"
        disabled={!interactive}
        onClick={() => {
          if (interactive) setOpen((v) => !v);
        }}
        className={`handoff-pill relative z-10 flex min-w-[10.5rem] items-center justify-center gap-2 whitespace-nowrap rounded-full border bg-canvas px-3.5 py-2 text-[13px] font-semibold tracking-[-0.01em] outline-none transition-colors sm:min-w-[12rem] sm:px-4 sm:text-[14px] ${
          interactive ? "cursor-pointer hover:bg-hover focus-visible:ring-2 focus-visible:ring-line-strong" : ""
        }`}
        aria-label={interactive ? `${label} Open handoff details` : label}
        aria-expanded={interactive ? visible : undefined}
      >
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="handoff-dot h-1.5 w-1.5 rounded-full bg-current"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
        {/* A live label comes from a harness file and can be a whole sentence.
            The pill is a fixed fixture in the header, so it clamps rather than
            growing — the full text is in the details panel. */}
        <span className="max-w-[11rem] truncate sm:max-w-[13rem]">{label}</span>
      </button>

      <span className="handoff-kiss-recv flex">
        <HandoffBead agentId="claudia" lead />
      </span>

      {interactive && visible && details && (
        <HandoffDetailsPanel label={label} details={details} forceOpen={forceOpen} onClose={() => setOpen(false)} align="center" />
      )}
    </div>
  );
}

function HandoffDetailsPanel({
  label,
  details,
  forceOpen,
  onClose,
  align,
}: {
  label: string;
  details: HandoffDetails;
  forceOpen: boolean;
  onClose: () => void;
  align: "center" | "end";
}) {
  return (
    <div
      className={`absolute top-[calc(100%+0.75rem)] z-50 w-[20rem] max-w-[calc(100vw-2rem)] rounded-lg border border-line-strong bg-canvas p-3 text-left text-ink shadow-2xl ${
        align === "center" ? "left-1/2 -translate-x-1/2" : "right-0"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">Handoff</div>
          <div className="mt-0.5 text-heading font-semibold text-ink">{label}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink ${
            forceOpen ? "invisible" : ""
          }`}
          aria-label="Close handoff details"
        >
          ×
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-meta">
        <dt className="text-ink-3">From</dt>
        <dd className="text-ink-2">{details.from}</dd>
        <dt className="text-ink-3">To</dt>
        <dd className="text-ink-2">{details.to}</dd>
        <dt className="text-ink-3">Why</dt>
        <dd className="text-ink-2">{details.why}</dd>
        <dt className="text-ink-3">Source</dt>
        <dd className="font-mono text-ink-2">{details.source}</dd>
        <dt className="text-ink-3">Next</dt>
        <dd className="text-ink-2">{details.next}</dd>
      </dl>

      <p className="mt-3 flex gap-2 border-t border-line pt-2 text-meta text-ink-3">
        <span className="mt-[3px]">
          <ProvenanceMark kind="illustrative" />
        </span>
        <span>
          Illustrative. No agent is running — this cycles through the shapes a
          handoff takes. Start the harness watcher and the header shows the
          roster working instead.
        </span>
      </p>
    </div>
  );
}

function HandoffBead({
  agentId,
  lead = false,
}: {
  agentId: AgentId;
  lead?: boolean;
}) {
  const hueClass = {
    claudia: "agent-violet",
    augustus: "agent-sky",
    julius: "agent-teal",
    athena: "agent-amber",
    hephaestus: "agent-rose",
  }[agentId];

  return (
    <span
      title={lead ? `${AGENTS[agentId].name} - Lead` : AGENTS[agentId].name}
      className={`${hueClass} handoff-bead relative z-20 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12`}
    >
      <span className="relay-token h-8 w-8 rounded-full sm:h-9 sm:w-9" aria-hidden="true" />
    </span>
  );
}

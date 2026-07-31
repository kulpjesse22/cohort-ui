"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getParticipant, isAgent, type ActorId } from "@/lib/agents";
import { getEntriesByDate, getActiveActorIds, type TimelineEntry } from "@/lib/timeline";
import { KIND_DOT, KIND_LABEL, VERDICT_STYLE } from "./AgentTimeline";
import { Avatar } from "./Avatar";

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Entry({ entry }: { entry: TimelineEntry }) {
  const participant = getParticipant(entry.agentId);
  const name = participant?.name ?? entry.agentId;
  const linkable = isAgent(entry.agentId);

  return (
    <div className="flex gap-3">
      <Avatar agentId={entry.agentId} size="sm" />

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {linkable ? (
            <Link
              href={`/agent/${entry.agentId}`}
              className="text-sm font-medium text-ink hover:underline"
            >
              {name}
            </Link>
          ) : (
            <span className="text-sm font-medium text-ink">{name}</span>
          )}

          {participant?.kind === "human" && (
            <span className="rounded border border-line-strong px-1 text-[10px] text-ink-2">
              human
            </span>
          )}

          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-4">
            <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[entry.kind]}`} />
            {KIND_LABEL[entry.kind]}
          </span>

          {entry.verdict && (
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${VERDICT_STYLE[entry.verdict]}`}
            >
              {entry.verdict}
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[14px] font-semibold text-ink">{entry.title}</p>
        <p className="mt-0.5 text-[14px] leading-relaxed text-ink-2">{entry.detail}</p>

        {entry.from && entry.to && (
          <p className="mt-1 font-mono text-[11px] text-approved">
            {entry.from} → {entry.to}
          </p>
        )}

        {entry.artifact && (
          <div className="mt-1 font-mono text-[10px] text-ink-4">{entry.artifact}</div>
        )}
      </div>
    </div>
  );
}

export function TeamTimeline() {
  const [filter, setFilter] = useState<ActorId | null>(null);

  const actorIds = useMemo(() => getActiveActorIds(), []);
  const groups = useMemo(() => getEntriesByDate(filter), [filter]);
  const total = useMemo(
    () => groups.reduce((n, g) => n + g.entries.length, 0),
    [groups]
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Everything that happened on this project, in one stream — human
            decisions and agent work side by side. Filter by participant, or open
            anyone&apos;s profile to see their record on its own.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              filter === null
                ? "border-ink-3 bg-raised text-ink"
                : "border-line-strong text-ink-2 hover:bg-hover hover:text-ink"
            }`}
          >
            Everyone
          </button>
          {actorIds.map((id) => {
            const p = getParticipant(id);
            if (!p) return null;
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(active ? null : id)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "border-ink-3 bg-raised text-ink"
                    : "border-line-strong text-ink-2 hover:bg-hover hover:text-ink"
                }`}
              >
                {p.name}
                {p.kind === "human" && (
                  <span className="text-[9px] uppercase tracking-wider text-ink-4">
                    human
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Project history
          </h2>
          <span className="text-[11px] text-ink-4">
            {total} {total === 1 ? "entry" : "entries"}
            {filter ? ` · ${getParticipant(filter)?.name}` : ""}
          </span>
        </div>

        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-ink-3">
            Nothing recorded yet.
          </p>
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group.date}>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="shrink-0 text-xs font-medium text-ink-2">
                    {formatDate(group.date)}
                  </h3>
                  <span className="h-px flex-1 bg-raised" />
                  <span className="shrink-0 text-[11px] text-ink-4">
                    {group.entries.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {group.entries.map((entry) => (
                    <Entry key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

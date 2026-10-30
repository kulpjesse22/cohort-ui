"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getParticipant, isAgent, type ActorId } from "@/lib/agents";
import { getEntriesByDate, getActiveActorIds, type TimelineEntry } from "@/lib/timeline";
import { KIND_LABEL } from "./AgentTimeline";
import { Avatar } from "./Avatar";
import { ArtifactLink } from "./ArtifactLink";
import { ContributionRecord } from "./ContributionRecord";
import { KindMark, ProvenanceTag, VerdictMark } from "./Marks";

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

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {linkable ? (
            <Link
              href={`/agent/${entry.agentId}`}
              className="text-meta font-semibold text-ink hover:underline"
            >
              {name}
            </Link>
          ) : (
            <span className="text-meta font-semibold text-ink">{name}</span>
          )}

          {participant?.kind === "human" && (
            <span className="text-meta text-ink-3">human</span>
          )}

          <span className="flex items-center gap-1.5 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
            <KindMark kind={entry.kind} />
            {KIND_LABEL[entry.kind]}
          </span>

          {entry.verdict && <VerdictMark verdict={entry.verdict} />}
        </div>

        <p className="mt-1 text-heading font-semibold text-ink">{entry.title}</p>
        <p className="mt-0.5 text-body text-ink-2">{entry.detail}</p>

        {entry.from && entry.to && (
          <p className="mt-1 text-meta text-ink-3">
            {entry.from} <span aria-hidden="true">→</span>{" "}
            <span className="font-semibold text-approved">{entry.to}</span>
          </p>
        )}

        {entry.artifact && (
          <div className="mt-1.5">
            <ArtifactLink path={entry.artifact} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  // The chosen name is a filled chip; the rest stay plain text. No outlined
  // pill per name.
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`chip flex min-h-8 items-center gap-1 rounded-md px-2 text-meta ${
        active ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
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
    <div className="flex-1 overflow-y-auto px-4 pb-16 pt-8 lg:px-6 lg:pt-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="max-w-xl font-display text-title font-semibold text-ink">
          Everything that happened, in one stream.{" "}
          <span className="text-ink-3">
            Human decisions and agent work, newest first.
          </span>
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <ProvenanceTag
            kind="seeded"
            title="Not yet derived from Agents/handoffs/ and Agents/lessons/"
          >
            History is seeded to show the shape
          </ProvenanceTag>
          <Link
            href="/demo"
            className="text-meta text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink-3"
          >
            New here? Take the tour
          </Link>
        </div>

        <div className="mt-12">
          <ContributionRecord />
        </div>

        <div className="mb-3 mt-14 flex items-baseline justify-between border-b border-line pb-2">
          <h2 className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">Project history</h2>
          <span className="text-meta tabular-nums text-ink-3">
            {total} {total === 1 ? "entry" : "entries"}
            {filter ? ` · ${getParticipant(filter)?.name}` : ""}
          </span>
        </div>

        <div className="-mx-2 mb-8 flex flex-wrap items-center gap-x-1 gap-y-1" role="group" aria-label="Filter by participant">
          <FilterButton active={filter === null} onClick={() => setFilter(null)}>
            Everyone
          </FilterButton>
          {actorIds.map((id) => {
            const p = getParticipant(id);
            if (!p) return null;
            const active = filter === id;
            return (
              <FilterButton key={id} active={active} onClick={() => setFilter(active ? null : id)}>
                {p.name}
                {p.kind === "human" && <span className="text-ink-3">· human</span>}
              </FilterButton>
            );
          })}
        </div>

        {groups.length === 0 ? (
          <p className="py-6 text-body text-ink-3">
            Nothing recorded yet{filter ? ` for ${getParticipant(filter)?.name}` : ""}.
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.date}>
                <h3 className="mb-4 flex items-baseline justify-between gap-3 text-meta font-semibold text-ink-2">
                  {formatDate(group.date)}
                  <span className="font-normal tabular-nums text-ink-3">
                    {group.entries.length}
                  </span>
                </h3>
                <div className="space-y-6">
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

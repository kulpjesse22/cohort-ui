"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AGENT_ORDER, AGENTS } from "@/lib/agents";
import { BOARD_STATES, SEEDED_CONVERSATIONS, STATE_LABEL, fromHandoffs, type Conversation } from "@/lib/board";
import { SEEDED_HANDOFFS, YOU, resolveHandoffs, type ReviewHandoff } from "@/lib/reviews";
import { useReviewSettings } from "@/lib/useReviewSettings";
import { AppShell } from "./AppShell";
import { Avatar } from "./Avatar";
import { ChatIcon, ReviewIcon } from "./Icons";
import { BoardStateMark, ProvenanceTag, RankTicks } from "./Marks";

function nameOf(id: string) {
  if (id === YOU) return "You";
  return AGENTS[id as keyof typeof AGENTS]?.name ?? id;
}

export function AgentsView({ live }: { live: ReviewHandoff[] }) {
  const { settings } = useReviewSettings();
  const all: Conversation[] = useMemo(() => {
    const resolved = resolveHandoffs([...SEEDED_HANDOFFS, ...live], settings);
    return [...fromHandoffs(resolved, nameOf), ...SEEDED_CONVERSATIONS];
  }, [live, settings]);

  const header = (
    <div className="min-w-0">
      <h1 className="truncate text-heading font-semibold text-ink">My agents</h1>
      <p className="truncate text-meta text-ink-3">The registry, and where each one&rsquo;s work stands.</p>
    </div>
  );

  return (
    <AppShell activeChannelId={null} header={header} rail={false}>
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-6 lg:px-6 lg:pt-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <ProvenanceTag kind="seeded" title="Counts come from the same conversations the Board shows.">
              Counted from the board: seeded, plus {live.length} {live.length === 1 ? "note" : "notes"} read live
            </ProvenanceTag>
            <Link
              href="/board"
              className="text-meta text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink-3"
            >
              Open the board
            </Link>
          </div>

          <ul className="mt-5 space-y-2">
            {AGENT_ORDER.map((id) => {
              const agent = AGENTS[id];
              const mine = all.filter((c) => c.agent === id);
              return (
                <li key={id} className="rounded-lg bg-raised px-4 py-3.5 sm:px-5">
                  <div className="flex items-start gap-3">
                    <Avatar agentId={id} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <Link href={`/agent/${id}`} className="font-display text-[1.125rem] font-semibold text-ink hover:underline">
                          {agent.name}
                        </Link>
                        <span className="flex items-center gap-1 text-label text-ink-3" title={`${agent.seniority}: a label, not a permission`}>
                          {agent.seniority}
                          <RankTicks rank={agent.rank} />
                        </span>
                      </div>
                      <p className="text-meta text-ink-3">{agent.title}</p>
                      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-label={`${agent.name}'s conversations by state`}>
                        {BOARD_STATES.map((s) => {
                          const n = mine.filter((c) => c.state === s).length;
                          return (
                            <li key={s} className={`flex items-center gap-1.5 text-meta ${n ? "text-ink-2" : "text-ink-4"}`}>
                              <BoardStateMark kind={s} className={n ? "text-ink-3" : "text-ink-4"} />
                              {STATE_LABEL[s]}
                              <span className="tabular-nums">{n}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1 pl-[3.25rem]">
                    <Link
                      href={`/c/${id}`}
                      className="aff flex min-h-8 items-center gap-1.5 rounded-md px-2 text-meta text-ink-2 hover:text-ink"
                    >
                      <ChatIcon className="h-4 w-4 text-ink-3" />
                      Conversations
                    </Link>
                    <Link
                      href={`/reviews?agent=${id}`}
                      className="aff flex min-h-8 items-center gap-1.5 rounded-md px-2 text-meta text-ink-2 hover:text-ink"
                    >
                      <ReviewIcon className="h-4 w-4 text-ink-3" />
                      Reviews
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-meta text-ink-3">
            Claude and Codex also hand work to you, through notes in <span className="font-mono text-label">Agents/handoffs/</span>.
            They are outside the registry, so they have no channel here; their handoffs are in Reviews.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

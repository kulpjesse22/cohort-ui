"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/messages";
import { Avatar } from "./Avatar";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return "Today";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Slack's rule: same author within 5 minutes continues the block. */
function continues(prev: Message | undefined, m: Message): boolean {
  if (!prev) return false;
  if (prev.authorId !== m.authorId) return false;
  if (new Date(m.ts).toDateString() !== new Date(prev.ts).toDateString()) return false;
  return new Date(m.ts).getTime() - new Date(prev.ts).getTime() < 5 * 60 * 1000;
}

function ThreadSkeleton() {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 lg:px-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-3">
          <div className="h-9 w-9 shrink-0 rounded-[8px] bg-raised" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-24 rounded bg-raised" />
            <div className="h-3 w-3/4 rounded bg-raised" />
            <div className="h-3 w-1/2 rounded bg-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-2">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function MessageThread({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  if (loading) return <ThreadSkeleton />;

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-ink">No messages yet</p>
        <p className="max-w-xs text-[14px] leading-relaxed text-ink-3">
          Brief them like you would a colleague. Whatever gets decided here
          should end up in the repo, not just the thread.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-3">
      {messages.map((message, i) => {
        const prev = messages[i - 1];
        const grouped = continues(prev, message);
        const newDay =
          !prev ||
          new Date(message.ts).toDateString() !== new Date(prev.ts).toDateString();

        return (
          <div key={message.id}>
            {newDay && (
              <div className="px-4 py-2 lg:px-6">
                <DayDivider label={formatDay(message.ts)} />
              </div>
            )}

            <div
              className={`group flex gap-3 px-4 transition-colors hover:bg-hover lg:px-6 ${
                grouped ? "py-0.5" : "mt-1 py-1.5"
              }`}
            >
              <div className="w-9 shrink-0">
                {grouped ? (
                  <span className="mt-0.5 block text-right text-[10px] leading-5 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100">
                    {formatTime(message.ts)}
                  </span>
                ) : (
                  <Avatar agentId={message.authorId} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {!grouped && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
                      {message.authorName}
                    </span>
                    <span className="text-[11px] text-ink-4">
                      {formatTime(message.ts)}
                    </span>
                    {message.pinned && (
                      <span className="rounded border border-line-strong px-1 text-[10px] text-ink-3">
                        pinned
                      </span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap text-[14px] leading-[1.62] text-ink-2">
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

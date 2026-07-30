"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/messages";
import { Avatar } from "./Avatar";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ThreadSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-3">
          <div className="h-9 w-9 shrink-0 rounded-md bg-zinc-800" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="h-3 w-3/4 rounded bg-zinc-800/70" />
            <div className="h-3 w-1/2 rounded bg-zinc-800/70" />
          </div>
        </div>
      ))}
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
    if (!loading) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, loading]);

  if (loading) {
    return <ThreadSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        No messages yet. Say something below.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <Avatar agentId={message.authorId} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-zinc-100">{message.authorName}</span>
              <span className="text-[11px] text-zinc-500">{formatTime(message.ts)}</span>
              {message.pinned && (
                <span className="rounded border border-zinc-700 px-1 text-[10px] text-zinc-400">
                  pinned
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-300">
              {message.text}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

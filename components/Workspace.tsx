"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getChannel } from "@/lib/agents";
import type { Message } from "@/lib/messages";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { MessageThread } from "./MessageThread";
import { Composer } from "./Composer";

const TOUR_HANDOFF: Message = {
  id: "tour-cohort-welcome",
  channelId: "cohort",
  authorId: "claudia",
  authorName: "Claudia",
  text: "You’ve seen how the team works. What would you like to do next? I can help turn a goal into a clear, durable plan.",
  ts: "2026-08-02T00:00:00.000Z",
};

export function Workspace({
  channelId,
  fresh = false,
}: {
  channelId: string;
  /** The tour hands off to a clean workspace, not the seeded demo log. */
  fresh?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContext, setLoadingContext] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);
  const [citedDocs, setCitedDocs] = useState<ContextDoc[]>([]);

  // Whatever the agent has put on the table, newest first, loaded for the rail
  // so "show them in preview" has somewhere to land.
  const citedPaths = useMemo(() => {
    const seen: string[] = [];
    for (const m of [...messages].reverse()) {
      for (const p of m.cites ?? []) if (!seen.includes(p)) seen.push(p);
    }
    return seen.slice(0, 3);
  }, [messages]);

  useEffect(() => {
    if (citedPaths.length === 0) {
      setCitedDocs([]);
      return;
    }
    let active = true;
    Promise.all(
      citedPaths.map((p) =>
        fetch(`/api/doc?path=${encodeURIComponent(p)}`)
          .then((r) => r.json())
          .then((d) => ({
            label: p.split("/").pop() ?? p,
            path: p,
            content: d.exists ? (d.content as string).replace(/<!--[\s\S]*?-->/g, "").trim() : null,
          }))
          .catch(() => ({ label: p, path: p, content: null }))
      )
    ).then((docs) => active && setCitedDocs(docs));
    return () => {
      active = false;
    };
  }, [citedPaths]);

  const channel = getChannel(channelId)!;
  const isAgentChannel = channel.kind === "agent";

  const loadChannel = useCallback(async (id: string) => {
    setLoadingMessages(true);
    setLoadingContext(true);

    const contextPromise = fetch(`/api/context/${id}`);

    if (fresh) {
      const contextRes = await contextPromise;
      const contextJson = await contextRes.json();
      setContextDocs(contextJson.docs ?? []);
      setLoadingContext(false);
      setMessages([{ ...TOUR_HANDOFF, channelId: id }]);
      setLoadingMessages(false);
      return;
    }

    const [messagesRes, contextRes] = await Promise.all([
      fetch(`/api/messages/${id}`),
      contextPromise,
    ]);

    const messagesJson = await messagesRes.json();
    setMessages(messagesJson.messages ?? []);
    setLoadingMessages(false);

    const contextJson = await contextRes.json();
    setContextDocs(contextJson.docs ?? []);
    setLoadingContext(false);
  }, [fresh]);

  useEffect(() => {
    loadChannel(channelId);
  }, [channelId, loadChannel]);

  async function handleSend(text: string) {
    const res = await fetch(`/api/messages/${channelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The deploy target is read-only, so the server has no memory of this
      // thread. The browser does — send what is on the table so a follow-up
      // like "show them in preview" can resolve.
      body: JSON.stringify({ text, recentCites: citedPaths }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to send message");
    }
    const { message, reply } = await res.json();
    setMessages((prev) => [...prev, message]);

    // Hold the reply behind a short typing state. The answer is already
    // computed; the pause is so a reply does not appear in the same frame as
    // the message it answers, which reads as canned.
    if (reply) {
      setTyping(reply.authorId);
      setTimeout(() => {
        setTyping(null);
        setMessages((prev) => [...prev, reply]);
      }, 700);
    }
  }

  const header = (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-ink">{channel.name}</h1>
        <p className="truncate text-xs text-ink-3">{channel.description}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        {isAgentChannel && (
          <Link
            href={`/agent/${channelId}`}
            className="shrink-0 rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-3 transition-colors hover:bg-hover hover:text-ink"
          >
            View profile
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <AppShell
      activeChannelId={channelId}
      header={header}
      contextDocs={contextDocs}
      citedDocs={citedDocs}
      loadingContext={loadingContext}
    >
      <MessageThread
        messages={messages}
        loading={loadingMessages}
        typing={typing}
        onPinned={(reply) => setMessages((prev) => [...prev, reply as Message])}
      />
      <Composer channelName={channel.name} onSend={handleSend} />
    </AppShell>
  );
}

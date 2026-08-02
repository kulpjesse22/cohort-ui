"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getChannel } from "@/lib/agents";
import type { Message } from "@/lib/messages";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { MessageThread } from "./MessageThread";
import { Composer } from "./Composer";
import { Facepile } from "./Facepile";

export function Workspace({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContext, setLoadingContext] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);

  const channel = getChannel(channelId)!;
  const isAgentChannel = channel.kind === "agent";

  const loadChannel = useCallback(async (id: string) => {
    setLoadingMessages(true);
    setLoadingContext(true);

    const [messagesRes, contextRes] = await Promise.all([
      fetch(`/api/messages/${id}`),
      fetch(`/api/context/${id}`),
    ]);

    const messagesJson = await messagesRes.json();
    setMessages(messagesJson.messages ?? []);
    setLoadingMessages(false);

    const contextJson = await contextRes.json();
    setContextDocs(contextJson.docs ?? []);
    setLoadingContext(false);
  }, []);

  useEffect(() => {
    loadChannel(channelId);
  }, [channelId, loadChannel]);

  async function handleSend(text: string) {
    const res = await fetch(`/api/messages/${channelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
        <Facepile memberIds={[...channel.memberIds, "jesse"]} />
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
      loadingContext={loadingContext}
    >
      <MessageThread messages={messages} loading={loadingMessages} typing={typing} />
      <Composer channelName={channel.name} onSend={handleSend} />
    </AppShell>
  );
}

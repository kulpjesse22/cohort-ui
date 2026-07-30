"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getChannel } from "@/lib/agents";
import type { Message } from "@/lib/messages";
import type { ContextDoc } from "@/lib/harness";
import { AppShell } from "./AppShell";
import { MessageThread } from "./MessageThread";
import { Composer } from "./Composer";

export function Workspace({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContext, setLoadingContext] = useState(true);

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
    const { message } = await res.json();
    setMessages((prev) => [...prev, message]);
  }

  const header = (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-zinc-100">{channel.name}</h1>
        <p className="truncate text-xs text-zinc-500">{channel.description}</p>
      </div>
      {isAgentChannel && (
        <Link
          href={`/agent/${channelId}`}
          className="hidden shrink-0 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 sm:block"
        >
          View profile
        </Link>
      )}
    </div>
  );

  return (
    <AppShell
      activeChannelId={channelId}
      header={header}
      contextDocs={contextDocs}
      loadingContext={loadingContext}
    >
      <MessageThread messages={messages} loading={loadingMessages} />
      <Composer channelName={channel.name} onSend={handleSend} />
    </AppShell>
  );
}

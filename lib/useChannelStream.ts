"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "./messages";
import type { Viewer } from "./realtime/presence";
import type { AgentStatus } from "./realtime/status";

const HEARTBEAT_MS = 5_000;

/** Stable for the life of a tab. Two tabs are two viewers, which is correct. */
function sessionId(): string {
  const existing = sessionStorage.getItem("cohort:session");
  if (existing) return existing;
  const id = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem("cohort:session", id);
  return id;
}

/**
 * A name you keep, if you have chosen one; otherwise one per tab.
 *
 * Deliberately not localStorage-by-default: two tabs on one machine are two
 * viewers, and giving them the same generated name makes the room unreadable
 * for the exact case people use to try this out. A name someone actually set
 * does persist, because that one is a choice rather than a placeholder.
 */
function displayName(id: string): string {
  const chosen = localStorage.getItem("cohort:name");
  if (chosen) return chosen;
  const existing = sessionStorage.getItem("cohort:guest-name");
  if (existing) return existing;
  const name = `Guest ${id.slice(0, 4)}`;
  sessionStorage.setItem("cohort:guest-name", name);
  return name;
}

/**
 * Subscribes a channel to the live stream and keeps the room told you're here.
 *
 * Two directions, deliberately separate. Down: an EventSource carrying
 * messages, viewers, and agent status. Up: a heartbeat POST that stops when
 * the tab is hidden, so "watching" means watching.
 */
export function useChannelStream(channelId: string) {
  const [streamed, setStreamed] = useState<Message[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [connected, setConnected] = useState(false);

  const typingRef = useRef(false);
  const identity = useRef<{ id: string; name: string } | null>(null);

  // A channel switch is a different room: drop what belonged to the last one
  // rather than letting it flash into the new thread. Adjusted during render
  // rather than in an effect, so the stale room never paints once first.
  const [room, setRoom] = useState(channelId);
  if (room !== channelId) {
    setRoom(channelId);
    setStreamed([]);
    setViewers([]);
    setStatuses([]);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!identity.current) {
      const id = sessionId();
      identity.current = { id, name: displayName(id) };
    }
    const me = identity.current;

    const source = new EventSource(`/api/stream/${channelId}`);

    source.addEventListener("open", () => setConnected(true));
    source.onerror = () => setConnected(false);

    source.addEventListener("sync", (e) => {
      setConnected(true);
      const { messages } = JSON.parse((e as MessageEvent).data) as { messages: Message[] };
      // Merge by id. The stream replays from the start of the log, and a
      // message you sent yourself already came back on the POST — both mean
      // the same message can arrive twice, and neither is an error.
      setStreamed((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const added = messages.filter((m) => !seen.has(m.id));
        return added.length ? [...prev, ...added] : prev;
      });
    });

    source.addEventListener("presence", (e) => {
      const { viewers: v } = JSON.parse((e as MessageEvent).data) as { viewers: Viewer[] };
      setViewers(v.filter((viewer) => viewer.sessionId !== me.id));
    });

    source.addEventListener("status", (e) => {
      const { statuses: s } = JSON.parse((e as MessageEvent).data) as { statuses: AgentStatus[] };
      setStatuses(s);
    });

    function beat(extra: Record<string, unknown> = {}) {
      const body = JSON.stringify({
        sessionId: me.id,
        name: me.name,
        typing: typingRef.current,
        ...extra,
      });
      // keepalive so the final beat survives the page going away.
      fetch(`/api/presence/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // A missed beat costs one window of presence, not correctness.
      });
    }

    function beatIfWatching() {
      if (document.visibilityState === "visible") beat();
    }

    beatIfWatching();
    const timer = window.setInterval(beatIfWatching, HEARTBEAT_MS);

    // Hiding the tab is the closest thing to "left the room" a browser offers,
    // and it is a better signal than unload, which never fires on mobile.
    function onVisibility() {
      if (document.visibilityState === "visible") beat();
      else beat({ leaving: true });
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", () => beat({ leaving: true }));

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      beat({ leaving: true });
      source.close();
      setConnected(false);
    };
  }, [channelId]);

  /** Called by the composer. The next heartbeat carries it; a start beats now. */
  const setTyping = useCallback(
    (typing: boolean) => {
      const was = typingRef.current;
      typingRef.current = typing;
      if (typing && !was && identity.current) {
        fetch(`/api/presence/${channelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: identity.current.id,
            name: identity.current.name,
            typing: true,
          }),
        }).catch(() => {});
      }
    },
    [channelId]
  );

  return { streamed, viewers, statuses, connected, setTyping };
}

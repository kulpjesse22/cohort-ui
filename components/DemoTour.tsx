"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AGENTS, getChannel, type AgentId } from "@/lib/agents";
import { DEMO_STEPS, type Spotlight } from "@/lib/demo";
import { getTimeline, getTimelineSummary } from "@/lib/timeline";
import type { Message } from "@/lib/messages";
import type { ContextDoc } from "@/lib/harness";
import { Sidebar } from "./Sidebar";
import { MessageThread } from "./MessageThread";
import { ContextRail } from "./ContextRail";
import { AgentTimeline } from "./AgentTimeline";
import { Avatar } from "./Avatar";

function dim(region: Spotlight, active: Spotlight): string {
  if (active === null) return "opacity-100";
  // "stats" spotlights a region inside main, so main itself stays lit.
  const lit = active === "stats" ? "main" : active;
  return region === lit ? "opacity-100" : "opacity-25";
}

export function DemoTour() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContext, setLoadingContext] = useState(true);

  const step = DEMO_STEPS[index];
  const isLast = index === DEMO_STEPS.length - 1;
  const targetId = step.view.id;

  // Functional update: rapid arrow presses must not read a stale index.
  const go = useCallback((delta: number) => {
    setIndex((i) => Math.min(Math.max(i + delta, 0), DEMO_STEPS.length - 1));
  }, []);

  // Load whatever the current step is looking at.
  useEffect(() => {
    let active = true;
    setLoadingContext(true);

    fetch(`/api/context/${targetId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        setContextDocs(json.docs ?? []);
        setLoadingContext(false);
      })
      .catch(() => active && setLoadingContext(false));

    if (step.view.kind === "channel") {
      setLoadingMessages(true);
      fetch(`/api/messages/${targetId}`)
        .then((r) => r.json())
        .then((json) => {
          if (!active) return;
          setMessages(json.messages ?? []);
          setLoadingMessages(false);
        })
        .catch(() => active && setLoadingMessages(false));
    }

    return () => {
      active = false;
    };
  }, [targetId, step.view.kind]);

  // Auto-advance, stopping at the end rather than looping.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playing) return;
    if (isLast) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIndex((i) => i + 1), step.holdMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, index, isLast, step.holdMs]);

  // Arrow keys and space, so the tour is drivable while recording.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(1);
      } else if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(-1);
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const isProfile = step.view.kind === "profile";
  const agent = isProfile ? AGENTS[targetId as AgentId] : null;
  const channel = !isProfile ? getChannel(targetId) : null;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-zinc-900">
      <div
        className={`hidden transition-opacity duration-500 lg:block ${dim("sidebar", step.spotlight)}`}
      >
        <Sidebar
          activeChannelId={isProfile ? null : targetId}
          onSelect={() => {}}
        />
      </div>

      <main
        className={`flex min-w-0 flex-1 flex-col transition-opacity duration-500 ${dim("main", step.spotlight)}`}
      >
        <header className="flex items-center gap-3 border-b border-zinc-800 px-5 py-3">
          {agent ? (
            <>
              <Avatar agentId={agent.id} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h1 className="truncate font-semibold text-zinc-100">{agent.name}</h1>
                  <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {agent.seniority}
                  </span>
                </div>
                <p className="truncate text-xs text-zinc-500">{agent.title}</p>
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold text-zinc-100">{channel?.name}</h1>
              <p className="truncate text-xs text-zinc-500">{channel?.description}</p>
            </div>
          )}
        </header>

        {isProfile ? (
          <AgentTimeline
            entries={getTimeline(targetId as AgentId)}
            summary={getTimelineSummary(targetId as AgentId)}
            highlightEntryId={step.focusEntryId}
            dimStats={step.spotlight === "main" && Boolean(step.focusEntryId)}
            dimEntries={step.spotlight === "stats"}
          />
        ) : (
          <MessageThread messages={messages} loading={loadingMessages} />
        )}
      </main>

      <div
        className={`hidden transition-opacity duration-500 lg:block ${dim("rail", step.spotlight)}`}
      >
        <ContextRail docs={contextDocs} loading={loadingContext} />
      </div>

      <CaptionBar
        index={index}
        total={DEMO_STEPS.length}
        title={step.title}
        body={step.body}
        playing={playing}
        isLast={isLast}
        onPrev={() => {
          setPlaying(false);
          go(-1);
        }}
        onNext={() => {
          setPlaying(false);
          go(1);
        }}
        onToggle={() => {
          if (isLast) {
            setIndex(0);
            setPlaying(true);
          } else {
            setPlaying((p) => !p);
          }
        }}
      />
    </div>
  );
}

function CaptionBar({
  index,
  total,
  title,
  body,
  playing,
  isLast,
  onPrev,
  onNext,
  onToggle,
}: {
  index: number;
  total: number;
  title: string;
  body: string;
  playing: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 p-4 lg:p-6">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-zinc-700 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur lg:p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= index ? "bg-zinc-300" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <Link
            href="/c/claudia"
            className="shrink-0 text-[11px] text-zinc-500 hover:text-zinc-300"
          >
            Exit
          </Link>
        </div>

        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{body}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 transition-opacity hover:bg-zinc-800 disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={onToggle}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
          >
            {isLast && !playing ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 transition-opacity hover:bg-zinc-800 disabled:opacity-30"
          >
            Next
          </button>
          <span className="ml-auto hidden text-[11px] text-zinc-600 sm:block">
            ← → to step · space to pause
          </span>
        </div>
      </div>
    </div>
  );
}

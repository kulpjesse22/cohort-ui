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
import { LessonLadder } from "./LessonLadder";
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
  const isMemory = step.view.kind === "memory";
  const agent = isProfile ? AGENTS[targetId as AgentId] : null;
  const channel = step.view.kind === "channel" ? getChannel(targetId) : null;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-canvas">
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
        <header className="flex items-center gap-3 border-b border-line px-5 py-3">
          {agent ? (
            <>
              <Avatar agentId={agent.id} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h1 className="truncate font-semibold text-ink">{agent.name}</h1>
                  <span className="shrink-0 rounded border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-2">
                    {agent.seniority}
                  </span>
                </div>
                <p className="truncate text-xs text-ink-3">{agent.title}</p>
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold text-ink">
                {isMemory ? "Team memory" : channel?.name}
              </h1>
              <p className="truncate text-xs text-ink-3">
                {isMemory
                  ? "What the team learned the hard way, and what it does about it."
                  : channel?.description}
              </p>
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
        ) : isMemory ? (
          <LessonLadder />
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
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-line-strong bg-panel/95 p-4 shadow-2xl backdrop-blur lg:p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-3">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= index ? "bg-brand" : "bg-line"
                }`}
              />
            ))}
          </div>
          <Link
            href="/start"
            className="shrink-0 text-[11px] text-ink-3 hover:text-ink"
          >
            Start with Claudia
          </Link>
        </div>

        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{body}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-opacity hover:bg-hover disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={onToggle}
            className="rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink hover:opacity-90"
          >
            {isLast && !playing ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-opacity hover:bg-hover disabled:opacity-30"
          >
            Next
          </button>
          <span className="ml-auto hidden text-[11px] text-ink-4 sm:block">
            ← → to step · space to pause
          </span>
        </div>
      </div>
    </div>
  );
}

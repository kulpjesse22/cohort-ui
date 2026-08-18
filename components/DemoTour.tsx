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
import { TeamTimeline } from "./TeamTimeline";
import { LeadHandoffIndicator, type HandoffDetails } from "./LeadHandoffIndicator";
import { Avatar } from "./Avatar";
import { AgentTrustChip } from "./AgentTrustChip";

/**
 * The handoff the tour is standing on. The final beat tells the viewer to open
 * the chip, so it has to have something true behind it — and the source is a
 * real file, so the claim can be checked rather than taken.
 */
const TOUR_HANDOFF: HandoffDetails = {
  from: "Jesse · Human lead",
  to: "Claudia · Agent lead",
  why: "New work needs scope, ownership, and safety gates before a builder touches it.",
  source: "Agents/planning.md",
  next: "Claudia routes a scoped task and sends the result to review.",
};

const TOUR_FLOW = [
  { label: "Intake", hue: "agent-violet" },
  { label: "Scope", hue: "agent-teal" },
  { label: "Handoff", hue: "agent-violet" },
  { label: "Review", hue: "agent-amber" },
  { label: "Lesson", hue: "agent-sky" },
  { label: "Growth", hue: "agent-teal" },
  { label: "Record", hue: "agent-rose" },
];

function dim(region: Spotlight, active: Spotlight): string {
  if (active === null) return "opacity-100";
  // "stats" spotlights a region inside main, so main itself stays lit.
  const lit = active === "stats" ? "main" : active;
  return region === lit ? "opacity-100" : "opacity-25";
}

export function DemoTour() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [handoffFrom, setHandoffFrom] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContext, setLoadingContext] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionLocked = useRef(false);

  const step = DEMO_STEPS[index];
  const isLast = index === DEMO_STEPS.length - 1;
  const targetId = step.view.id;

  const moveTo = useCallback((next: number) => {
    const clamped = Math.min(Math.max(next, 0), DEMO_STEPS.length - 1);
    if (transitionLocked.current) return;
    if (phase !== "idle") return;
    if (clamped === index) return;
    if (timer.current) clearTimeout(timer.current);

    transitionLocked.current = true;
    setHandoffFrom(index);
    setDirection(clamped < index ? "back" : "forward");
    setPhase("out");
    window.setTimeout(() => {
      setIndex(clamped);
      setPhase("in");
      window.setTimeout(() => {
        setPhase("idle");
        setHandoffFrom(null);
        transitionLocked.current = false;
      }, 1040);
    }, 340);
  }, [index, phase]);

  const go = useCallback((delta: number) => {
    moveTo(index + delta);
  }, [index, moveTo]);

  const jumpTo = useCallback((next: number) => {
    moveTo(next);
  }, [moveTo]);

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
  useEffect(() => {
    if (!playing) return;
    if (isLast) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => moveTo(index + 1), step.holdMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, index, isLast, step.holdMs, moveTo]);

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

  const kind = step.view.kind;
  const isProfile = kind === "profile";
  const isMemory = kind === "memory";
  const isTimeline = kind === "timeline";
  const agent = isProfile ? AGENTS[targetId as AgentId] : null;
  const channel = kind === "channel" ? getChannel(targetId) : null;

  // What the chrome says above each surface. The splash is its own full page,
  // so it gets no header at all.
  const heading = isMemory
    ? { title: "Team memory", sub: "What the team learned the hard way, and what it does about it." }
    : isTimeline
      ? { title: "Project timeline", sub: "All work across the team — humans and agents — newest first." }
      : { title: channel?.name ?? "", sub: channel?.description ?? "" };

  const caption = (
    <CaptionBar
      index={index}
      total={DEMO_STEPS.length}
      title={step.title}
      body={step.body}
      phase={phase}
      direction={direction}
      handoffFrom={handoffFrom}
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
      onJump={(next) => {
        setPlaying(false);
        jumpTo(next);
      }}
      onToggle={() => {
        if (isLast) {
          moveTo(0);
          setPlaying(true);
        } else {
          setPlaying((p) => !p);
        }
      }}
    />
  );

  return (
    <div className="tour-cruise relative flex h-screen w-full overflow-hidden bg-canvas">
      <div
        className={`hidden transition-opacity duration-500 lg:block ${dim("sidebar", step.spotlight)}`}
      >
        <Sidebar
          activeChannelId={isProfile ? null : targetId}
          onSelect={() => {}}
        />
      </div>

      {/* Main is not dimmed as a whole. The chip lives in the header now, the
          way it does in the product, and opacity inherits — so the title and
          the body dim independently or the handoff beat could never light it. */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div
            key={`header-${index}`}
            className={`flex min-w-0 flex-1 items-center gap-3 transition-opacity duration-500 ${dim("main", step.spotlight)}`}
          >
            {agent ? (
              <>
                <Avatar agentId={agent.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h1 className="truncate font-semibold text-ink">{agent.name}</h1>
                    <AgentTrustChip
                      agentId={agent.id}
                      compact
                      forceOpen={step.focusEntryId === "ju-6"}
                    />
                  </div>
                  <p className="truncate text-xs text-ink-3">{agent.title}</p>
                </div>
              </>
            ) : (
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-semibold text-ink">{heading.title}</h1>
                <p className="truncate text-xs text-ink-3">{heading.sub}</p>
              </div>
            )}
          </div>

          <div
            className={`tour-handoff-dock hidden shrink-0 transition-opacity duration-500 md:flex ${dim("handoff", step.spotlight)}`}
          >
            <LeadHandoffIndicator
              label="Checking scope..."
              details={TOUR_HANDOFF}
              forceOpen={step.spotlight === "handoff"}
              compact
            />
          </div>
        </header>

        <div
          className={`tour-surface tour-surface-${direction} tour-phase-${phase} flex min-h-0 flex-1 flex-col transition-opacity duration-700 ${dim("main", step.spotlight)}`}
        >
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
        ) : isTimeline ? (
          <TeamTimeline />
        ) : (
          <MessageThread messages={messages} loading={loadingMessages} />
        )}
        </div>
      </main>

      <div
        className={`hidden transition-opacity duration-500 lg:block ${dim("rail", step.spotlight)}`}
      >
        <ContextRail docs={contextDocs} loading={loadingContext} />
      </div>

      {caption}
    </div>
  );
}

function CaptionBar({
  index,
  total,
  title,
  body,
  phase,
  direction,
  handoffFrom,
  playing,
  isLast,
  onPrev,
  onNext,
  onJump,
  onToggle,
}: {
  index: number;
  total: number;
  title: string;
  body: string;
  phase: "idle" | "out" | "in";
  direction: "forward" | "back";
  handoffFrom: number | null;
  playing: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  onToggle: () => void;
}) {
  return (
    <div className="tour-caption-layer pointer-events-none absolute inset-x-0 bottom-0 z-50 p-4 lg:p-6">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-line-strong bg-panel/95 p-4 shadow-2xl backdrop-blur lg:p-5">
        <div className="mb-3 flex items-center gap-3">
          <TourFlow
            index={index}
            total={total}
            phase={phase}
            direction={direction}
            handoffFrom={handoffFrom}
            onJump={onJump}
          />
          {/* The way out of the tour is into the workspace, not into one
              agent's channel. Cohort is the product; Claudia is a role in it. */}
          <Link
            href="/start"
            className="shrink-0 text-[11px] text-ink-3 hover:text-ink"
          >
            Open Cohort
          </Link>
        </div>

        <div key={index} className={`tour-caption-copy tour-phase-${phase}`}>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{body}</p>
        </div>

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

function TourFlow({
  index,
  total,
  phase,
  direction,
  handoffFrom,
  onJump,
}: {
  index: number;
  total: number;
  phase: "idle" | "out" | "in";
  direction: "forward" | "back";
  handoffFrom: number | null;
  onJump: (index: number) => void;
}) {
  return (
    <div className="tour-step-flow min-w-0 flex-1 overflow-x-auto">
      <div className="flex min-w-max items-center gap-1.5 pr-1">
        {Array.from({ length: total }).map((_, i) => {
          const active = i === index;
          const exiting = phase !== "idle" && handoffFrom === i && handoffFrom !== index;
          const expanded = active || exiting;
          const done = i < index || exiting;
          const item = TOUR_FLOW[i] ?? TOUR_FLOW[TOUR_FLOW.length - 1];

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onJump(i)}
              className={`${item.hue} tour-step-slot group relative flex h-7 w-9 items-center justify-center outline-none transition-[width] duration-700 ease-out focus-visible:ring-2 focus-visible:ring-line-strong ${
                expanded ? "tour-step-slot-active sm:w-[7.25rem]" : ""
              } ${
                active && phase === "out" ? `tour-step-send-${direction}` : ""
              } ${
                active && phase === "in" ? `tour-step-receive-${direction}` : ""
              } ${
                exiting && phase === "in" ? `tour-step-exit-${direction}` : ""
              }`}
              aria-current={active ? "step" : undefined}
              aria-label={`Step ${i + 1} of ${total}: ${item.label}`}
            >
              <span
                className={`tour-step-bubble relay-token absolute rounded-full transition-all duration-700 ease-out ${
                  expanded ? "h-4 w-4 opacity-0" : done ? "h-3.5 w-3.5 opacity-85" : "h-3 w-3 opacity-55"
                }`}
                aria-hidden="true"
              />
              <span
                className={`tour-step-chip tour-step-chip-active absolute inline-flex items-center gap-1.5 rounded-full border bg-canvas px-2.5 py-1 text-[10px] font-semibold text-current transition-all duration-700 ease-out ${
                  expanded
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-1 scale-95 opacity-0"
                }`}
                aria-hidden={!expanded}
              >
                <span className="relay-token h-3.5 w-3.5 shrink-0 rounded-full" aria-hidden="true" />
                <span className="flex w-4 items-center justify-center gap-0.5" aria-hidden="true">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="handoff-dot h-1 w-1 rounded-full bg-current"
                      style={{ animationDelay: `${dot * 160}ms` }}
                    />
                  ))}
                </span>
                <span className="hidden w-[3.25rem] text-left sm:inline">{item.label}</span>
              </span>
            </button>
          );
        })}
        <span className="ml-1 shrink-0 font-mono text-[11px] text-ink-3">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

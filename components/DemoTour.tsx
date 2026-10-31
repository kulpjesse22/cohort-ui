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
import { AgentMasthead } from "./AgentMasthead";
import { LessonLadder } from "./LessonLadder";
import { TeamTimeline } from "./TeamTimeline";
import { LeadHandoffIndicator, type HandoffDetails } from "./LeadHandoffIndicator";
import { Avatar } from "./Avatar";
import { ProvenanceTag } from "./Marks";

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

const TOUR_FLOW = ["Intake", "Scope", "Handoff", "Review", "Lesson", "Growth", "Record"];

function dim(region: Spotlight, active: Spotlight): string {
  if (active === null) return "opacity-100";
  // "stats" spotlights a region inside main, so main itself stays lit.
  const lit = active === "stats" ? "main" : active;
  return region === lit ? "opacity-100" : "opacity-25";
}

/**
 * The tour is the product with a caption over it. Its header, surfaces and
 * marks are the app's own, so the tour can never drift into a second design:
 * a change to the workspace shows up here without touching this file.
 */
export function DemoTour() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
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
    setPhase("out");
    window.setTimeout(() => {
      setIndex(clamped);
      setPhase("in");
      window.setTimeout(() => {
        setPhase("idle");
        transitionLocked.current = false;
      }, 340);
    }, 340);
  }, [index, phase]);

  const go = useCallback((delta: number) => {
    moveTo(index + delta);
  }, [index, moveTo]);

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

  const heading = isMemory
    ? { title: "Team memory", sub: "What the team learned the hard way, and what it does about it." }
    : isTimeline
      ? { title: "Project timeline", sub: "All work across the team — humans and agents — newest first." }
      : { title: channel?.name ?? "", sub: channel?.description ?? "" };

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

      {/* Main is not dimmed as a whole: the handoff sits in the header, and
          opacity inherits, so the title and the body dim on their own or the
          handoff beat could never light it. */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-2 lg:px-6">
          <div
            key={`header-${index}`}
            className={`flex min-w-0 flex-1 items-center gap-3 transition-opacity duration-500 ${dim("main", step.spotlight)}`}
          >
            {agent ? (
              <>
                <Avatar agentId={agent.id} size="md" />
                <h1 className="min-w-0 flex-1 truncate text-heading font-semibold text-ink">
                  {agent.name}
                </h1>
              </>
            ) : (
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-heading font-semibold text-ink">{heading.title}</h1>
                <p className="truncate text-meta text-ink-3">{heading.sub}</p>
              </div>
            )}
          </div>

          <div
            className={`hidden shrink-0 transition-opacity duration-500 md:flex ${dim("handoff", step.spotlight)}`}
          >
            <LeadHandoffIndicator
              label="Checking scope..."
              details={TOUR_HANDOFF}
              forceOpen={step.spotlight === "handoff"}
              variant="line"
            />
          </div>
        </header>

        <div
          className={`tour-surface tour-phase-${phase} flex min-h-0 flex-1 flex-col transition-opacity duration-500 ${dim("main", step.spotlight)}`}
        >
          {isProfile && agent ? (
            <AgentTimeline
              entries={getTimeline(agent.id)}
              summary={getTimelineSummary(agent.id)}
              masthead={<AgentMasthead agentId={agent.id} name={agent.name} title={agent.title} />}
              highlightEntryId={step.focusEntryId}
              dimStats={step.spotlight === "main" && Boolean(step.focusEntryId)}
              dimEntries={step.spotlight === "stats"}
            />
          ) : isMemory ? (
            <LessonLadder />
          ) : isTimeline ? (
            <TeamTimeline />
          ) : (
            <MessageThread
              messages={messages}
              loading={loadingMessages}
              provenance={
                <ProvenanceTag
                  kind="seeded"
                  title="No live model. The conversation is written in advance to show the shape of the work."
                >
                  Seeded conversation. Replies are scripted, not generated.
                </ProvenanceTag>
              }
            />
          )}
        </div>
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
        phase={phase}
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
          moveTo(next);
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
    </div>
  );
}

function CaptionBar({
  index,
  total,
  title,
  body,
  phase,
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
  playing: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  onToggle: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 p-3 lg:p-6">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-line-strong bg-panel p-4 lg:p-5">
        <div className="mb-3 flex items-center gap-3">
          <TourSteps index={index} total={total} onJump={onJump} />
          {/* The way out of the tour is into the workspace, not into one
              agent's channel. Cohort is the product; Claudia is a role in it. */}
          <Link
            href="/start"
            className="aff shrink-0 rounded-md px-2 py-1 text-meta text-ink-3 hover:text-ink"
          >
            Open Cohort
          </Link>
        </div>

        <div key={index} className={`tour-caption-copy tour-phase-${phase}`}>
          <h2 className="text-heading font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-body text-ink-2">{body}</p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="aff-fill rounded-md px-2.5 py-1.5 text-meta text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={onToggle}
            className="rounded-md bg-control px-3 py-1.5 text-meta font-semibold text-control-ink hover:opacity-90"
          >
            {isLast && !playing ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="aff-fill rounded-md px-2.5 py-1.5 text-meta text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
          <span className="ml-auto hidden text-meta text-ink-3 sm:block">
            ← → to step · space to pause
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * One dot per beat in a fixed slot, so nothing reflows as the tour moves. The
 * current beat is the brand's one tour moment; the rest are grey by shape and
 * tone, not borrowed agent hues.
 */
function TourSteps({
  index,
  total,
  onJump,
}: {
  index: number;
  total: number;
  onJump: (index: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="flex shrink-0 items-center" role="group" aria-label="Tour steps">
        {Array.from({ length: total }).map((_, i) => {
          const tone = i === index ? "bg-brand" : i < index ? "bg-ink-3" : "bg-line-strong";
          return (
            <button
              key={TOUR_FLOW[i] ?? i}
              type="button"
              onClick={() => onJump(i)}
              aria-current={i === index ? "step" : undefined}
              aria-label={`Step ${i + 1} of ${total}: ${TOUR_FLOW[i] ?? ""}`}
              className="aff flex h-7 w-6 items-center justify-center rounded-md"
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${tone}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <span className="min-w-0 truncate text-meta tabular-nums text-ink-3">
        <span className="text-ink-2">{TOUR_FLOW[index]}</span>
        <span className="hidden sm:inline"> · {index + 1} of {total}</span>
      </span>
    </div>
  );
}
